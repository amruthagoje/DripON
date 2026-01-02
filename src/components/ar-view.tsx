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
  onCapture: (dataUrl: string, type: 'photo' | 'video') => void;
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
    if (!videoRef.current || !selectedGarment) return;
  
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    // Draw the video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // Create an Image element for the garment
    const garmentImage = new window.Image();
    garmentImage.crossOrigin = 'anonymous'; // Handle potential CORS issues
    garmentImage.src = selectedGarment.image;
  
    garmentImage.onload = () => {
      // Calculate aspect ratios
      const videoAspectRatio = canvas.width / canvas.height;
      const garmentAspectRatio = garmentImage.width / garmentImage.height;
  
      let drawWidth, drawHeight, x, y;
  
      // This logic tries to replicate `object-fit: contain`
      if (videoAspectRatio > garmentAspectRatio) {
        // Video is wider than garment image
        drawHeight = canvas.height * 0.8; // Use 80% of video height
        drawWidth = drawHeight * garmentAspectRatio;
      } else {
        // Video is taller or same aspect ratio
        drawWidth = canvas.width * 0.8; // Use 80% of video width
        drawHeight = drawWidth / garmentAspectRatio;
      }
      
      // Center the image
      x = (canvas.width - drawWidth) / 2;
      y = (canvas.height - drawHeight) / 2;
  
      // Draw the garment image on top
      ctx.drawImage(garmentImage, x, y, drawWidth, drawHeight);
  
      // Get the final image
      const dataUrl = canvas.toDataURL('image/jpeg');
      onCapture(dataUrl, 'photo');
    };

    garmentImage.onerror = () => {
      // Fallback to just video if garment fails to load
      const dataUrl = canvas.toDataURL('image/jpeg');
      onCapture(dataUrl, 'photo');
      toast({
        variant: 'destructive',
        title: 'Could not load garment image.',
        description: 'Captured video frame without overlay.',
      });
    }
  };

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
        const reader = new FileReader();
        reader.onload = () => {
          onCapture(reader.result as string, 'video');
        };
        reader.readAsDataURL(blob);
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
          {hasCameraPermission === null && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 z-10">
                <p>Requesting camera permission...</p>
             </div>
          )}
          <video ref={videoRef} className={cn("w-full h-full object-cover", hasCameraPermission ? 'opacity-100' : 'opacity-0')} autoPlay muted playsInline />
          {hasCameraPermission === false && (
            <div className='absolute inset-0'>
                <Image
                src={picsum_images.person_fallback.src}
                alt="Person fallback"
                fill
                className="object-cover"
                priority
                data-ai-hint="person fashion"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 z-10">
                  <VideoOff className="h-16 w-16 mb-4" />
                  <h3 className="text-xl font-bold">Camera permission denied</h3>
                  <p className="text-center">Please enable camera access in your browser to continue.</p>
                </div>
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 z-10 pointer-events-none">
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

    