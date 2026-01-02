
"use client";

import { useState } from 'react';
import Image from 'next/image';

import type { CapturedItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, ImageIcon, VideoIcon } from 'lucide-react';


interface CapturedMediaGalleryProps {
  items: CapturedItem[];
}

export default function CapturedMediaGallery({ items }: CapturedMediaGalleryProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CapturedItem | null>(null);
  
  const handleViewClick = (item: CapturedItem) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleDownloadClick = (item: CapturedItem) => {
    window.open(item.url, '_blank');
  };


  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
           <CardTitle className="font-headline">Captured Media</CardTitle>
           <CardDescription>Download your virtual outfits.</CardDescription>
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
                  <Image src={item.url} alt={`Captured ${item.type}`} layout="fill" objectFit="cover" className="rounded-md" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-md gap-2">
                    <div className="flex items-center justify-center">
                      {item.type === 'photo' ? <ImageIcon className="h-6 w-6 text-white" /> : <VideoIcon className="h-6 w-6 text-white" />}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleViewClick(item)} variant="secondary">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" onClick={() => handleDownloadClick(item)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Captured {selectedItem?.type}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
             <div className="relative aspect-[9/16] w-full mx-auto">
                {selectedItem.type === 'photo' ? (
                    <Image 
                        src={selectedItem.url} 
                        alt={`Captured ${selectedItem.type}`} 
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                    />
                ) : (
                    <video src={selectedItem.url} controls autoPlay className="w-full h-full rounded-md" />
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
