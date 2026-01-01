
export interface Friend {
  id: string;
  name: string;
  relationship: string;
  imageUrl: string;
  message: string;
  isGenerating: boolean;
}

export enum RelationshipType {
  FRIEND = 'Friend',
  FAMILY = 'Family',
  COLLEAGUE = 'Colleague',
  PARTNER = 'Partner'
}