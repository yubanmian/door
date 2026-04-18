export interface Scenery {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  quote: string;
  lat: number;
  lng: number;
}

export type AppState = 'closed' | 'opening' | 'opened';
