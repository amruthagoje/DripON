export interface Garment {
  id: number;
  name: string;
  image: string;
  'data-ai-hint'?: string;
}

export interface CapturedItem {
  id: number;
  type: 'photo' | 'video';
  url: string; // Changed from thumbnail to url to store data URL
}
