import { Tabs } from 'expo-router';
import React from 'react';
import { Animated } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
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
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.1 : 1 }] }}>
              <IconSymbol size={28} name="circle.grid.3x3.fill" color={color} />
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
    </Tabs>
  );
}

