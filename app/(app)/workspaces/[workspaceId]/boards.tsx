import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Card } from '~/components/ui/card';
import { WorkspaceBanner } from '~/components/workspace-banner';

// Mock data for boards
const MOCK_BOARDS = [
  { id: 'default-board', title: 'Product Roadmap', description: 'Q3/Q4 planning and feature tracking.' },
  { id: '2', title: 'Sprint Board', description: 'Current active sprint tasks and issues.' },
  { id: '3', title: 'Design System', description: 'UI components and design tokens.' },
];

export default function BoardsScreen() {
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();

  return (
    <View className="flex-1 bg-background p-4">
      <WorkspaceBanner />
      <Text className="text-2xl font-bold text-foreground mb-6">Boards</Text>

      <FlatList
        data={MOCK_BOARDS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/workspaces/${workspaceId}/boards/${item.id}`} asChild>
            <Pressable>
              <Card className="mb-4 p-5">
                <Text className="text-lg font-semibold text-foreground mb-1">{item.title}</Text>
                <Text className="text-sm text-muted-foreground">{item.description}</Text>
              </Card>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-muted-foreground">No boards found.</Text>
          </View>
        }
      />
    </View>
  );
}
