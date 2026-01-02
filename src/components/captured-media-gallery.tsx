"use client";

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useToast } from "@/hooks/use-toast";
import type { CapturedItem } from '@/lib/types';
import { handleGestureTransfer } from '@/lib/actions';
import { transferSchema } from '@/lib/schemas';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Share2, ImageIcon, VideoIcon } from 'lucide-react';


interface CapturedMediaGalleryProps {
  items: CapturedItem[];
}

export default function CapturedMediaGallery({ items }: CapturedMediaGalleryProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CapturedItem | null>(null);
  const [mediaData, setMediaData] = useState<string>('');

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      gestureType: 'Swipe Left',
      destinationDeviceId: '',
    },
  });

  const toDataURL = (url: string): Promise<string> =>
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob()
      })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));

  const handleShareClick = async (item: CapturedItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
    
    startTransition(async () => {
      try {
        // Use a placeholder for the data URL generation to avoid hitting network
        const dataUri = await toDataURL(item.thumbnail);
        setMediaData(dataUri);
      } catch (error) {
        console.error("Error converting image to data URI:", error);
        toast({
            variant: "destructive",
            title: "Error preparing media",
            description: "Could not prepare the media for transfer.",
        });
        setDialogOpen(false);
      }
    });
  };

  async function onSubmit(values: z.infer<typeof transferSchema>) {
    if (!mediaData) {
        toast({
            variant: "destructive",
            title: "Media not ready",
            description: "Please wait for the media to finish preparing.",
        });
        return;
    }

    startTransition(async () => {
      const result = await handleGestureTransfer(mediaData, values);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Transfer Failed",
          description: result.error,
        });
      } else {
        toast({
          title: "Transfer Initiated",
          description: result.success,
        });
        setDialogOpen(false);
        form.reset();
      }
    });
  }

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
           <CardTitle className="font-headline">Captured Media</CardTitle>
           <CardDescription>Share your virtual outfits.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No captures yet.</p>
              <p className="text-sm">Use the buttons below the AR view.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => (
                <div key={item.id} className="relative group aspect-square">
                  <Image src={item.thumbnail} alt={`Captured ${item.type}`} layout="fill" objectFit="cover" className="rounded-md" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-md">
                    {item.type === 'photo' ? <ImageIcon className="h-6 w-6 text-white mb-2" /> : <VideoIcon className="h-6 w-6 text-white mb-2" />}
                    <Button size="sm" onClick={() => handleShareClick(item)} disabled={isPending}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer via Gesture</DialogTitle>
            <DialogDescription>
              Select a gesture and enter a destination device ID to transfer the media.
            </DialogDescription>
          </DialogHeader>
          { (isPending && !mediaData) ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <p className="ml-4">Preparing media...</p>
            </div>
          ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="gestureType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gesture</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a gesture" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Swipe Left">Swipe Left</SelectItem>
                        <SelectItem value="Swipe Right">Swipe Right</SelectItem>
                        <SelectItem value="Pinch">Pinch</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationDeviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Device ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., my-phone-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isPending || !mediaData}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Transfer
                </Button>
              </DialogFooter>
            </form>
          </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
