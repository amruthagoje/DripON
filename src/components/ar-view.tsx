'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Garment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Video, VideoOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ARViewProps {
  selectedGarment: Garment | null;
  onCapture: (type: 'photo' | 'video') => void;
}

export default function ARView({ selectedGarment, onCapture }: ARViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }

  }, [toast]);

  return (
    <div className="relative w-full">
      <Card className="w-full aspect-[9/16] max-h-[75vh] overflow-hidden relative shadow-lg flex items-center justify-center">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover z-0" autoPlay muted playsInline />
        
        {hasCameraPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 z-30">
                <VideoOff className="h-16 w-16 mb-4" />
                <h3 className="text-xl font-bold">Camera permission denied</h3>
                <p className="text-center">Please enable camera access in your browser to continue.</p>
            </div>
        )}
        
        <AnimatePresence>
          {selectedGarment && (
            <motion.div
              key={selectedGarment.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none z-10"
            >
              <Image
                src={selectedGarment.image}
                alt={selectedGarment.name}
                width={400}
                height={600}
                style={{objectFit: "contain"}}
                className="drop-shadow-2xl"
                data-ai-hint={selectedGarment['data-ai-hint']}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {hasCameraPermission === false && (
            <div className="absolute bottom-4 left-4 right-4 z-20">
                <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser settings to use this feature.
                    </AlertDescription>
                </Alert>
            </div>
        )}

      </Card>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 bg-background/80 backdrop-blur-sm text-primary hover:bg-background shadow-lg"
          variant="outline"
          aria-label="Take Photo"
          onClick={() => onCapture('photo')}
          disabled={!hasCameraPermission}
        >
          <Camera className="h-7 w-7" />
        </Button>
        <Button
          size="lg"
          className="rounded-full h-16 w-16 bg-accent/90 backdrop-blur-sm text-accent-foreground hover:bg-accent shadow-lg"
          aria-label="Record Video"
          onClick={() => onCapture('video')}
          disabled={!hasCameraPermission}
        >
          <Video className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
}
