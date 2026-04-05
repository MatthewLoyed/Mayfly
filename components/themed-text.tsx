import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'titleRounded' | 'subtitleSerif';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'titleRounded' ? styles.titleRounded : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'subtitleSerif' ? styles.subtitleSerif : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts?.sans,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: Fonts?.sans,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    fontFamily: Fonts?.sans,
  },
  titleRounded: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    fontFamily: Fonts?.rounded,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Fonts?.sans,
    letterSpacing: -0.5,
  },
  subtitleSerif: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: Fonts?.serif,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    fontFamily: Fonts?.sans,
  },
});

