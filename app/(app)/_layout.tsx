import { Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';

import { useColorScheme } from '~/hooks/useColorScheme';

export default function AppTabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)',
          borderTopColor: isDark ? 'hsl(240 3.7% 15.9%)' : 'hsl(240 5.9% 90%)',
        },
        tabBarActiveTintColor: isDark ? 'hsl(0 0% 98%)' : 'hsl(240 5.9% 10%)',
        tabBarInactiveTintColor: isDark ? 'hsl(240 5% 64.9%)' : 'hsl(240 3.8% 46.1%)',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size ?? 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Feather name="activity" size={size ?? 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size ?? 20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size ?? 20} color={color} />,
        }}
      />
    </Tabs>
  );
}

