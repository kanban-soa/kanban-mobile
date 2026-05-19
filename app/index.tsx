import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '~/store/auth.store';

export default function IndexScreen() {
  const status = useAuthStore((state) => state.status);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    if (status === 'idle') {
      hydrate();
    }
  }, [hydrate, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(app)');
      return;
    }
    if (status === 'unauthenticated' || status === 'error') {
      router.replace('/(auth)/login');
    }
  }, [status]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator />
    </View>
  );
}

