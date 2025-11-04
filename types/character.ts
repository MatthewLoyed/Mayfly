export type CharacterMood = 'happy' | 'encouraging' | 'celebrating' | 'gentle';

export interface CharacterState {
  mood: CharacterMood;
  totalInteractions: number;
  lastInteractionDate?: string;
  updatedAt: string;
}

