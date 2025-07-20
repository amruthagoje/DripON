'use client';

import Image from 'next/image';
import type { Garment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Shirt } from 'lucide-react';

interface GarmentSelectorProps {
  garments: Garment[];
  selectedGarment: Garment | null;
  onSelectGarment: (garment: Garment) => void;
}

export default function GarmentSelector({
  garments,
  selectedGarment,
  onSelectGarment,
}: GarmentSelectorProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Shirt className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="font-headline">Choose an Outfit</CardTitle>
                <CardDescription>Select an item to try on.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 pr-4">
          <div className="grid grid-cols-3 gap-4">
            {garments.map((garment) => (
              <button
                key={garment.id}
                onClick={() => onSelectGarment(garment)}
                className={cn(
                  'relative aspect-[2/3] rounded-lg overflow-hidden focus:outline-none transition-all duration-300 ring-offset-background ring-offset-2 focus:ring-2 ring-accent',
                  selectedGarment?.id === garment.id ? 'ring-2 ring-primary' : 'hover:opacity-80'
                )}
                aria-label={`Select ${garment.name}`}
              >
                <Image
                  src={garment.image}
                  alt={garment.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={garment['data-ai-hint']}
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-1 left-1 right-1 p-1 bg-black/50 backdrop-blur-sm rounded-md">
                    <p className="text-white text-xs text-center truncate">{garment.name}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
