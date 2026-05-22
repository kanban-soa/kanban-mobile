import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Platform, View } from 'react-native';
import { vars } from 'nativewind';

import { useColorScheme } from '~/hooks/useColorScheme';

const lightVars = vars({
  '--background': '0 0% 100%',
  '--foreground': '240 10% 3.9%',
  '--muted': '240 4.8% 95.9%',
  '--muted-foreground': '240 3.8% 46.1%',
  '--border': '240 5.9% 90%',
  '--card': '0 0% 100%',
  '--card-foreground': '240 10% 3.9%',
  '--primary': '240 5.9% 10%',
  '--primary-foreground': '0 0% 98%',
  '--destructive': '0 84.2% 60.2%',
  '--radius': '12px',
});

const darkVars = vars({
  '--background': '240 10% 3.9%',
  '--foreground': '0 0% 98%',
  '--muted': '240 3.7% 15.9%',
  '--muted-foreground': '240 5% 64.9%',
  '--border': '240 3.7% 15.9%',
  '--card': '240 10% 3.9%',
  '--card-foreground': '0 0% 98%',
  '--primary': '0 0% 98%',
  '--primary-foreground': '240 5.9% 10%',
  '--destructive': '0 62.8% 30.6%',
  '--radius': '12px',
});

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'hsl(0 0% 100%)',
    card: 'hsl(0 0% 100%)',
    text: 'hsl(240 10% 3.9%)',
    border: 'hsl(240 5.9% 90%)',
    primary: 'hsl(240 5.9% 10%)',
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'hsl(240 10% 3.9%)',
    card: 'hsl(240 10% 3.9%)',
    text: 'hsl(0 0% 98%)',
    border: 'hsl(240 3.7% 15.9%)',
    primary: 'hsl(0 0% 98%)',
  },
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const activeColorScheme = colorScheme ?? 'light';
  const queryClient = useMemo(() => new QueryClient(), []);
  const themeVars = activeColorScheme === 'dark' ? darkVars : lightVars;
  const theme = activeColorScheme === 'dark' ? darkTheme : lightTheme;
  const [isClient, setIsClient] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsClient(true);
    }
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <View
            className={`flex-1 bg-background ${activeColorScheme === 'dark' ? 'dark' : ''}`}
            style={themeVars}
          >
            <ThemeProvider value={theme}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
              </Stack>
              <StatusBar style={activeColorScheme === 'dark' ? 'light' : 'dark'} />
            </ThemeProvider>
          </View>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
