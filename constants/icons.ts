import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export const AppIcons = {
  // Common icons
  add: 'add-outline',
  close: 'close-outline',
  check: 'checkmark-circle-outline',
  checkmark: 'checkmark-outline',
  settings: 'settings-outline',
  home: 'home-outline',
  stats: 'bar-chart-outline',
  
  // Habit specific icons
  water: 'water-outline',
  walk: 'walk-outline',
  barbell: 'barbell-outline',
  book: 'book-outline',
  flame: 'flame-outline',
  moon: 'moon-outline',
  briefcase: 'briefcase-outline',
  leaf: 'leaf-outline',
  alarm: 'alarm-outline',
  
  // Hallucination fixes
  heart: 'heart-outline',
  pulse: 'pulse-outline',
  body: 'body-outline',
  bulb: 'bulb-outline',
  trophy: 'trophy-outline',
  
  // Others
  search: 'search-outline',
  notifications: 'notifications-outline',
  calendar: 'calendar-outline',
  person: 'person-outline',
  mail: 'mail-outline',
  lock: 'lock-closed-outline',
  trash: 'trash-outline',
  edit: 'create-outline',
  share: 'share-social-outline',
  info: 'information-circle-outline',
  help: 'help-circle-outline',
  refresh: 'refresh-outline',
  star: 'star-outline',
  chevronRight: 'chevron-forward-outline',
  chevronLeft: 'chevron-back-outline',
  chevronUp: 'chevron-up-outline',
  chevronDown: 'chevron-down-outline',
} as const satisfies Record<string, IoniconsName>;
