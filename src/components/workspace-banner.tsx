import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useActiveWorkspaceStore } from '~/store/active-workspace.store';

export function WorkspaceBanner() {
  const router = useRouter();
  const activeWorkspace = useActiveWorkspaceStore((state) => state.activeWorkspace);

  if (!activeWorkspace) return null;

  return (
    <Pressable
      onPress={() => router.push('/(app)')}
      accessibilityRole="button"
      accessibilityLabel={`Currently in ${activeWorkspace.name}. Tap to switch workspace.`}
      className="flex-row items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 mb-4 active:opacity-80"
    >
      <View className="flex-row items-center flex-1">
        <Feather name="briefcase" size={14} className="text-muted-foreground mr-2" />
        <Text className="text-xs text-muted-foreground mr-2">Workspace</Text>
        <Text className="text-sm font-semibold text-foreground flex-1" numberOfLines={1}>
          {activeWorkspace.name}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-xs text-muted-foreground mr-1">Switch</Text>
        <Feather name="chevron-right" size={14} className="text-muted-foreground" />
      </View>
    </Pressable>
  );
}
