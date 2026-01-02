import { FieldValue } from "firebase/firestore";

export interface Garment {
  id: number;
  name: string;
  image: string;
  'data-ai-hint'?: string;
}

export interface CapturedItem {
  id: string;
  userId: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string; 
  timestamp: FieldValue;
  garmentId: string;
  garmentName: string;
  garmentImage: string;
}
