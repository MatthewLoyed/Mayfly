import { Tabs } from 'expo-router';
import React from 'react';
import { Animated } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const colors = Colors[colorScheme ?? 'dark'];
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundSubtle,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
              <IconSymbol size={28} name="house.fill" color={color} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: 'Todos',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
              <IconSymbol size={28} name="checklist" color={color} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: 'Garden',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
              <IconSymbol size={28} name="leaf.fill" color={color} />
            </Animated.View>
          ),
        }}
      />
      {/* Hidden but kept for potential future use */}
      <Tabs.Screen
        name="habits"
        options={{
          href: null, // Hide from tab bar but keep route accessible
          title: 'Habits',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
              <IconSymbol size={28} name="circle.grid.3x3.fill" color={color} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="hobbies"
        options={{
          title: 'Hobbies',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
              <IconSymbol size={28} name="star.fill" color={color} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
              <IconSymbol size={28} name="gearshape.fill" color={color} />
            </Animated.View>
          ),
        }}
      />
    </Tabs>
  );
}

