'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Garment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Video, StopCircle, VideoOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { picsum_images } from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';

interface ARViewProps {
  selectedGarment: Garment | null;
  onCapture: (type: 'photo' | 'video', dataUrl: string) => void;
}

export default function ARView({ selectedGarment, onCapture }: ARViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
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
    };
  }, [toast]);
  
  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    onCapture('photo', dataUrl);
  }

  const handleVideoClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onCapture('video', url);
        recordedChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="relative w-full">
      <Card className="w-full aspect-[9/16] max-h-[75vh] overflow-hidden relative shadow-lg flex items-center justify-center bg-muted">
        <div className="absolute inset-0">
          {hasCameraPermission ? (
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          ) : (
            <Image
              src={picsum_images.person_fallback.src}
              alt="Person fallback"
              fill
              className="object-cover"
              priority
              data-ai-hint="person fashion"
            />
          )}
          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 z-10">
              <VideoOff className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-bold">Camera permission denied</h3>
              <p className="text-center">Please enable camera access in your browser to continue.</p>
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 z-20 pointer-events-none">
          <AnimatePresence>
            {selectedGarment && (
              <motion.div
                key={selectedGarment.id}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <Image
                  src={selectedGarment.image}
                  alt={selectedGarment.name}
                  width={400}
                  height={600}
                  style={{objectFit: 'contain'}}
                  className="drop-shadow-2xl"
                  data-ai-hint={selectedGarment['data-ai-hint']}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 bg-background/80 backdrop-blur-sm text-primary hover:bg-background shadow-lg"
          variant="outline"
          aria-label="Take Photo"
          onClick={takePhoto}
          disabled={!hasCameraPermission}
        >
          <Camera className="h-7 w-7" />
        </Button>
        <Button
          size="lg"
          className={cn(
            "rounded-full h-16 w-16 backdrop-blur-sm shadow-lg transition-colors",
            isRecording 
              ? "bg-red-500/90 text-white hover:bg-red-600"
              : "bg-accent/90 text-accent-foreground hover:bg-accent"
          )}
          aria-label={isRecording ? "Stop Recording" : "Record Video"}
          onClick={handleVideoClick}
          disabled={!hasCameraPermission}
        >
          {isRecording ? <StopCircle className="h-7 w-7" /> : <Video className="h-7 w-7" />}
        </Button>
      </div>
    </div>
  );
}
