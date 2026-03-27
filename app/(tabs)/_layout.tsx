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
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.habitStroke + '22',
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
              <IconSymbol size={28} name="house.fill" color={color} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
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
            <Animated.View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
              <IconSymbol size={28} name="leaf.fill" color={color} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="hobbies"
        options={{
          title: 'Pursuits',
          tabBarIcon: ({ color, focused }) => (
            <Animated.View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
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

