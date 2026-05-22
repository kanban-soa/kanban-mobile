import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Feather } from '@expo/vector-icons';

// Mock data for workspaces
const INITIAL_WORKSPACES = [
  { id: 'default', name: 'Personal Workspace', description: 'My private projects and tasks.' },
  { id: 'school', name: 'School Projects', description: 'Assignments and group work.' },
  { id: 'work', name: 'Development Team', description: 'Work related boards and roadmaps.' },
];

export default function HomeScreen() {
  const [workspaces, setWorkspaces] = useState(INITIAL_WORKSPACES);
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleAddWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      setIsAddingWorkspace(false);
      return;
    }
    const newWs = {
      id: Date.now().toString(),
      name: newWorkspaceName.trim(),
      description: 'New workspace created recently.',
    };
    setWorkspaces([newWs, ...workspaces]);
    setNewWorkspaceName('');
    setIsAddingWorkspace(false);
  };

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-3xl font-bold text-foreground">Workspaces</Text>
        <Button 
          size="sm" 
          variant="outline" 
          onPress={() => setIsAddingWorkspace(true)}
          className="rounded-full w-10 h-10 p-0"
        >
          <Feather name="plus" size={20} className="text-foreground" />
        </Button>
      </View>

      {isAddingWorkspace && (
        <Card className="mb-6 p-4 border-primary/20">
          <Text className="text-lg font-semibold text-foreground mb-3">Create New Workspace</Text>
          <Input
            autoFocus
            placeholder="Workspace Name"
            value={newWorkspaceName}
            onChangeText={setNewWorkspaceName}
            className="mb-4"
          />
          <View className="flex-row gap-3">
            <Button className="flex-1" onPress={handleAddWorkspace}>
              <Text className="text-white font-semibold">Create</Text>
            </Button>
            <Button variant="ghost" className="flex-1" onPress={() => setIsAddingWorkspace(false)}>
              <Text className="text-muted-foreground">Cancel</Text>
            </Button>
          </View>
        </Card>
      )}

      <FlatList
        data={workspaces}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Link href={`/workspaces/${item.id}/boards`} asChild>
            <Pressable>
              <Card className="mb-4 p-5 active:bg-muted/10">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-xl font-semibold text-foreground mb-1">{item.name}</Text>
                    <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} className="text-muted-foreground ml-2" />
                </View>
              </Card>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-muted-foreground">No workspaces found.</Text>
          </View>
        }
      />
    </View>
  );
}
