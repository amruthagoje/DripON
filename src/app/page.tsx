"use client";

import { useState } from 'react';
import type { Garment, CapturedItem } from '@/lib/types';
import Header from '@/components/header';
import ARView from '@/components/ar-view';
import GarmentSelector from '@/components/garment-selector';
import CapturedMediaGallery from '@/components/captured-media-gallery';

const garments: Garment[] = [
  { id: 1, name: 'Cyberpunk Jacket', image: 'https://picsum.photos/seed/1/400/600', 'data-ai-hint': 'jacket cyberpunk' },
  { id: 2, name: 'Holo-Dress', image: 'https://picsum.photos/seed/2/400/600', 'data-ai-hint': 'dress futuristic' },
  { id: 3, name: 'Gravity Boots', image: 'https://picsum.photos/seed/3/400/600', 'data-ai-hint': 'boots sci-fi' },
  { id: 4, name: 'Stealth Suit', image: 'https://picsum.photos/seed/4/400/600', 'data-ai-hint': 'bodysuit stealth' },
  { id: 5, name: 'Neon Visor', image: 'https://picsum.photos/seed/5/400/600', 'data-ai-hint': 'visor neon' },
  { id: 6, name: 'Yellow T-Shirt', image: 'https://picsum.photos/seed/6/400/600', 'data-ai-hint': 'yellow t-shirt' },
  { id: 7, name: 'Pink T-Shirt', image: 'https://picsum.photos/seed/7/400/600', 'data-ai-hint': 'pink t-shirt' },
  { id: 8, name: 'Black T-Shirt', image: 'https://picsum.photos/seed/8/400/600', 'data-ai-hint': 'black t-shirt' },
];

export default function Home() {
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(garments[0]);
  const [capturedItems, setCapturedItems] = useState<CapturedItem[]>([]);

  const handleCapture = (type: 'photo' | 'video') => {
    const newItem: CapturedItem = {
      id: Date.now(),
      type: type,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/150/200`
    };
    setCapturedItems(prevItems => [newItem, ...prevItems]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 w-full">
            <ARView 
              selectedGarment={selectedGarment} 
              onCapture={handleCapture} 
            />
          </div>
          <div className="flex flex-col gap-8 w-full">
            <GarmentSelector 
              garments={garments} 
              onSelectGarment={setSelectedGarment} 
              selectedGarment={selectedGarment}
            />
            <CapturedMediaGallery items={capturedItems} />
          </div>
        </div>
      </main>
    </div>
  );
}
