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

// Serene Botanical Color Palette
const forestCharcoal = '#1A1C1A';
const organicSurface = '#252825';
const sageGrowth = '#9CAF88';
const lavenderMist = '#B5A8D6';
const sunsetGold = '#E6B874';
const riverStone = '#3A3D3A';
const morningMist = '#E8E8E8';
const stoneGrey = '#A0A0A0';

const tintColorLight = sageGrowth;
const tintColorDark = sageGrowth;

export const Colors = {
  light: {
    text: morningMist,
    background: forestCharcoal,
    tint: tintColorLight,
    icon: stoneGrey,
    tabIconDefault: riverStone,
    tabIconSelected: tintColorLight,
    // Habit-specific colors
    habitComplete: sageGrowth,
    habitIncomplete: riverStone,
    habitStroke: stoneGrey,
    streak: sunsetGold,
    primary: sageGrowth,
    secondary: lavenderMist,
    accent: sunsetGold,
    warning: '#D48D78', // Soft terracota
    backgroundSubtle: organicSurface,
    // Design System Specifics
    cardBackground: organicSurface,
    textSecondary: stoneGrey,
  },
  dark: {
    text: morningMist,
    background: forestCharcoal,
    tint: tintColorDark,
    icon: stoneGrey,
    tabIconDefault: riverStone,
    tabIconSelected: tintColorDark,
    // Dark mode habit colors
    habitComplete: sageGrowth,
    habitIncomplete: riverStone,
    habitStroke: stoneGrey,
    streak: sunsetGold,
    primary: sageGrowth,
    secondary: lavenderMist,
    accent: sunsetGold,
    warning: '#D48D78',
    backgroundSubtle: organicSurface,
    // Design System Specifics
    cardBackground: organicSurface,
    textSecondary: stoneGrey,
  },
};

export const Layout = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  screen: {
    small: 375, // iPhone SE width
    medium: 414, // iPhone Plus width
    large: 768, // iPad width
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
