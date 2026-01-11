import { type CharacterMood, type CharacterState } from '@/types/character';
import { getDatabase } from './database';

/**
 * Get current character state
 */
export async function getCharacterState(): Promise<CharacterState> {
  const db = await getDatabase();

  type CharacterStateRow = {
    mood: string;
    total_interactions: number;
    last_interaction_date: string | null;
    updated_at: string;
  };

  const state = await db.getFirstAsync(
    'SELECT * FROM character_state WHERE id = 1'
  ) as CharacterStateRow | undefined;

  if (!state) {
    // Initialize if doesn't exist
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO character_state (id, mood, total_interactions, updated_at) VALUES (1, ?, 0, ?)',
      ['happy', now]
    );
    return {
      mood: 'happy',
      totalInteractions: 0,
      updatedAt: now,
    };
  }

  return {
    mood: state.mood as CharacterMood,
    totalInteractions: state.total_interactions,
    lastInteractionDate: state.last_interaction_date || undefined,
    updatedAt: state.updated_at,
  };
}

/**
 * Update character mood
 */
export async function updateCharacterMood(mood: CharacterMood): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE character_state SET mood = ?, updated_at = ? WHERE id = 1',
    [mood, now]
  );
}

/**
 * Increment interaction count and update last interaction date
 */
export async function incrementInteractions(): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE character_state SET total_interactions = total_interactions + 1, last_interaction_date = ?, updated_at = ? WHERE id = 1',
    [now, now]
  );
}

/**
 * Update character state (mood and interaction count)
 */
export async function updateCharacterState(mood: CharacterMood): Promise<void> {
  await updateCharacterMood(mood);
  await incrementInteractions();
}

