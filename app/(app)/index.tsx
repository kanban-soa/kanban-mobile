import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { useActiveWorkspaceStore } from '~/store/active-workspace.store';

type Workspace = {
  id: string;
  name: string;
  description: string;
};

const INITIAL_WORKSPACES: Workspace[] = [
  { id: 'default', name: 'Personal Workspace', description: 'My private projects and tasks.' },
  { id: 'school', name: 'School Projects', description: 'Assignments and group work.' },
  { id: 'work', name: 'Development Team', description: 'Work related boards and roadmaps.' },
];

export default function HomeScreen() {
  const router = useRouter();
  const setActiveWorkspace = useActiveWorkspaceStore((state) => state.setActiveWorkspace);
  const clearActiveWorkspace = useActiveWorkspaceStore((state) => state.clearActiveWorkspace);

  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeMenuWorkspace = workspaces.find((w) => w.id === activeMenuId) ?? null;
  const closeMenu = () => setActiveMenuId(null);

  const handleAddWorkspace = () => {
    if (!newWorkspaceName.trim()) {
      setIsAddingWorkspace(false);
      return;
    }
    const newWs: Workspace = {
      id: Date.now().toString(),
      name: newWorkspaceName.trim(),
      description: 'New workspace created recently.',
    };
    setWorkspaces([newWs, ...workspaces]);
    setNewWorkspaceName('');
    setIsAddingWorkspace(false);
  };

  const handleOpenWorkspace = (workspace: Workspace) => {
    setActiveWorkspace({ id: workspace.id, name: workspace.name });
    router.push(`/workspaces/${workspace.id}/boards`);
  };

  const handleStartRename = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setEditingName(workspace.name);
    closeMenu();
  };

  const handleCommitRename = () => {
    if (!editingWorkspace) return;
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditingWorkspace(null);
      return;
    }
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === editingWorkspace.id ? { ...w, name: trimmed } : w)),
    );
    setEditingWorkspace(null);
  };

  const handleDelete = (workspace: Workspace) => {
    closeMenu();
    Alert.alert(
      'Delete workspace',
      `Are you sure you want to delete "${workspace.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setWorkspaces((prev) => prev.filter((w) => w.id !== workspace.id));
            clearActiveWorkspace();
          },
        },
      ],
    );
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
        renderItem={({ item }) => {
          const isEditing = editingWorkspace?.id === item.id;
          return (
            <Pressable onPress={() => !isEditing && handleOpenWorkspace(item)}>
              <Card className="mb-4 p-5 active:bg-muted/10">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    {isEditing ? (
                      <Input
                        autoFocus
                        value={editingName}
                        onChangeText={setEditingName}
                        onBlur={handleCommitRename}
                        onSubmitEditing={handleCommitRename}
                        className="mb-1"
                      />
                    ) : (
                      <Text className="text-xl font-semibold text-foreground mb-1">{item.name}</Text>
                    )}
                    <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setActiveMenuId(item.id)}
                    accessibilityLabel={`Open actions for ${item.name}`}
                    className="p-2"
                  >
                    <Feather name="more-vertical" size={18} className="text-muted-foreground" />
                  </Pressable>
                </View>
              </Card>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-muted-foreground">No workspaces found.</Text>
          </View>
        }
      />

      <Modal
        visible={activeMenuWorkspace !== null}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
          onPress={closeMenu}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="bg-background rounded-t-2xl p-4 pb-8 border-t border-border"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 12,
              }}
            >
              {activeMenuWorkspace && (
                <>
                  <View className="self-center w-10 h-1 rounded-full bg-border mb-4" />
                  <Text className="text-base font-semibold text-foreground mb-4">
                    {activeMenuWorkspace.name}
                  </Text>

                  <ActionRow
                    icon="edit-2"
                    label="Rename workspace"
                    onPress={() => handleStartRename(activeMenuWorkspace)}
                  />
                  <ActionRow
                    icon="trash-2"
                    label="Delete workspace"
                    destructive
                    onPress={() => handleDelete(activeMenuWorkspace)}
                  />

                  <Pressable onPress={closeMenu} className="mt-2 p-3 items-center">
                    <Text className="text-muted-foreground font-medium">Cancel</Text>
                  </Pressable>
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

type ActionRowProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

function ActionRow({ icon, label, destructive, onPress }: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center py-3 px-1 active:opacity-70"
    >
      <Feather
        name={icon}
        size={18}
        className={destructive ? 'text-destructive' : 'text-foreground'}
      />
      <Text
        className={`ml-3 text-base ${destructive ? 'text-destructive' : 'text-foreground'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
