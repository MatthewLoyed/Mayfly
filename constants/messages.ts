import { CharacterMood } from '@/types/character';

export type MessageContext =
  | 'habit_completion'
  | 'streak_milestone'
  | 'first_completion'
  | 'todo_completion'
  | 'all_todos_done'
  | 'missed_habit'
  | 'daily_greeting'
  | 'general_encouragement';

interface MessageSet {
  messages: string[];
  mood: CharacterMood;
}

export const MESSAGE_SETS: Record<MessageContext, MessageSet> = {
  habit_completion: {
    messages: [
      "Nice one! That's what I like to see!",
      "You're building something great!",
      "Another day, another win!",
      "We're going places together!",
      "Small, consistent wins build something great!",
      "You did it! That's another day together!",
      "Focus on what matters - and you did!",
    ],
    mood: 'celebrating',
  },
  streak_milestone: {
    messages: [
      "Look at that streak growing!",
      "Consistency is your superpower!",
      "You're on fire!",
      "This is what steady progress looks like!",
      "Small wins add up to something amazing!",
    ],
    mood: 'celebrating',
  },
  first_completion: {
    messages: [
      "Hey there! Let's build some great habits together!",
      "Ready to make today count?",
      "Welcome! Every habit starts with one day!",
      "Here we go! Today's the day!",
    ],
    mood: 'happy',
  },
  todo_completion: {
    messages: [
      "Check that off! One less thing to worry about!",
      "Done! Focus on what matters - and you did!",
      "You can't do everything, but you're doing what matters!",
      "Nice! Saying no to distractions, saying yes to focus!",
    ],
    mood: 'encouraging',
  },
  all_todos_done: {
    messages: [
      "You did it all! Amazing!",
      "Everything checked off! You can't do everything, but you did what mattered!",
      "All done! That's what focus looks like!",
      "Complete! Small, focused wins build something great!",
    ],
    mood: 'celebrating',
  },
  missed_habit: {
    messages: [
      "That's okay! Tomorrow's a new chance.",
      "Even the best have off days.",
      "What matters is getting back to it.",
      "It's okay to have limits. Tomorrow we try again!",
      "No worries! Small wins, small setbacks - all part of the journey.",
    ],
    mood: 'gentle',
  },
  daily_greeting: {
    messages: [
      "Hey there! Ready to make today count?",
      "Good to see you! Let's focus on what matters today.",
      "Welcome back! Remember: you can't do everything, but you can do what matters.",
      "Hello! Focus on 3 things today, not 30.",
    ],
    mood: 'happy',
  },
  general_encouragement: {
    messages: [
      "You can't do everything, but you can do what matters!",
      "Saying no is a superpower!",
      "Focus on 3 things today, not 30.",
      "It's okay to have limits.",
      "What you don't do matters as much as what you do!",
      "Small, consistent wins build something great!",
    ],
    mood: 'encouraging',
  },
};

/**
 * Get a random message for a given context
 */
export function getRandomMessage(context: MessageContext): string {
  const messageSet = MESSAGE_SETS[context];
  const messages = messageSet.messages;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * Get the mood associated with a message context
 */
export function getMoodForContext(context: MessageContext): CharacterMood {
  return MESSAGE_SETS[context].mood;
}

