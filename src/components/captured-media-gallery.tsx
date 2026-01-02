
"use client";

import { useState } from 'react';
import Image from 'next/image';

import type { CapturedItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, ImageIcon, VideoIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


interface CapturedMediaGalleryProps {
  items: CapturedItem[];
  isLoading: boolean;
}

export default function CapturedMediaGallery({ items, isLoading }: CapturedMediaGalleryProps) {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CapturedItem | null>(null);
  
  const handleViewClick = (item: CapturedItem) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleDownloadClick = (item: CapturedItem) => {
    const link = document.createElement('a');
    link.href = item.mediaUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
           <CardTitle className="font-headline">Captured Media</CardTitle>
           <CardDescription>Download your virtual outfits.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No captures yet.</p>
              <p className="text-sm">Use the buttons below the AR view.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {items.map((item) => (
                <div key={item.id} className="relative group aspect-square">
                  {item.mediaType === 'photo' ? (
                    <img src={item.mediaUrl} alt={`Captured ${item.mediaType}`} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <video src={item.mediaUrl} muted loop playsInline className="w-full h-full object-cover rounded-md" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-md gap-2">
                    <div className="flex items-center justify-center">
                      {item.mediaType === 'photo' ? <ImageIcon className="h-6 w-6 text-white" /> : <VideoIcon className="h-6 w-6 text-white" />}
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
            <DialogTitle>Captured {selectedItem?.mediaType}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
             <div className="relative w-full">
                {selectedItem.mediaType === 'photo' ? (
                  <Image
                    src={selectedItem.mediaUrl}
                    alt={`Captured ${selectedItem.mediaType}`}
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                    className="rounded-md"
                  />
                ) : (
                    <video src={selectedItem.mediaUrl} controls autoPlay className="w-full h-auto rounded-md" />
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
