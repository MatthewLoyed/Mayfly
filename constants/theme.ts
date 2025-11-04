/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Friendly, minimalistic color palette
// Using variables for easy theme switching (as per user preference)
const primaryLight = '#6C5CE7'; // Soft purple
const primaryDark = '#A29BFE'; // Lighter purple for dark mode
const successLight = '#00B894'; // Soft green
const successDark = '#00D68F'; // Brighter green for dark mode
const streakLight = '#FDCB6E'; // Warm yellow
const streakDark = '#FFC048'; // Brighter yellow for dark mode
const warningLight = '#E17055'; // Soft coral
const warningDark = '#FF7675'; // Brighter coral for dark mode

const tintColorLight = primaryLight;
const tintColorDark = primaryDark;

export const Colors = {
  light: {
    text: '#2D3436',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#636E72',
    tabIconDefault: '#B2BEC3',
    tabIconSelected: tintColorLight,
    // Habit-specific colors
    habitComplete: successLight,
    habitIncomplete: '#DFE6E9',
    habitStroke: '#B2BEC3',
    streak: streakLight,
    primary: primaryLight,
    secondary: '#A29BFE',
    accent: successLight,
    warning: warningLight,
    backgroundSubtle: '#F8F9FA',
  },
  dark: {
    text: '#ECEDEE',
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#636E72',
    tabIconSelected: tintColorDark,
    // Dark mode habit colors
    habitComplete: successDark,
    habitIncomplete: '#2D3436',
    habitStroke: '#636E72',
    streak: streakDark,
    primary: primaryDark,
    secondary: primaryLight,
    accent: successDark,
    warning: warningDark,
    backgroundSubtle: '#242424',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
