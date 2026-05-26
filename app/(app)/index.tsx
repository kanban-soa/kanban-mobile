import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { ConfirmDialog } from '~/components/confirm-dialog';
import {
  WorkspaceFormDialog,
  type WorkspaceFormValues,
} from '~/components/workspace/workspace-form-dialog';
import { useActiveWorkspaceStore } from '~/store/active-workspace.store';
import { useSurfaceColors } from '~/lib/surface-colors';

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
  const colors = useSurfaceColors();
  const setActiveWorkspace = useActiveWorkspaceStore((state) => state.setActiveWorkspace);
  const clearActiveWorkspace = useActiveWorkspaceStore((state) => state.clearActiveWorkspace);

  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);

  const activeMenuWorkspace = workspaces.find((w) => w.id === activeMenuId) ?? null;
  const closeMenu = () => setActiveMenuId(null);

  const handleOpenWorkspace = (workspace: Workspace) => {
    setActiveWorkspace({ id: workspace.id, name: workspace.name });
    router.push(`/workspaces/${workspace.id}/boards`);
  };

  const openCreate = () => {
    setEditingWorkspace(null);
    setFormMode('create');
  };

  const openEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setFormMode('edit');
    closeMenu();
  };

  const handleFormSubmit = (values: WorkspaceFormValues) => {
    if (formMode === 'create') {
      const newWs: Workspace = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description || 'New workspace.',
      };
      setWorkspaces((prev) => [newWs, ...prev]);
    } else if (formMode === 'edit' && editingWorkspace) {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === editingWorkspace.id
            ? { ...w, name: values.name, description: values.description || w.description }
            : w,
        ),
      );
    }
    setFormMode(null);
    setEditingWorkspace(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingWorkspace) return;
    setWorkspaces((prev) => prev.filter((w) => w.id !== deletingWorkspace.id));
    clearActiveWorkspace();
    setDeletingWorkspace(null);
  };

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-3xl font-bold text-foreground">Workspaces</Text>
        <Button
          size="sm"
          variant="outline"
          onPress={openCreate}
          className="rounded-full w-10 h-10 p-0"
        >
          <Feather name="plus" size={20} className="text-foreground" />
        </Button>
      </View>

      <FlatList
        data={workspaces}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleOpenWorkspace(item)}>
            <Card className="mb-4 p-5 active:bg-muted/10">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-xl font-semibold text-foreground mb-1">{item.name}</Text>
                  <Text className="text-sm text-muted-foreground" numberOfLines={2}>
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
        )}
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
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={closeMenu}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="rounded-t-2xl p-4 pb-8"
              style={{
                backgroundColor: colors.background,
                borderTopWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 12,
              }}
            >
              {activeMenuWorkspace && (
                <>
                  <View
                    className="self-center w-10 h-1 rounded-full mb-4"
                    style={{ backgroundColor: colors.border }}
                  />
                  <Text className="text-base font-semibold text-foreground mb-4">
                    {activeMenuWorkspace.name}
                  </Text>

                  <ActionRow
                    icon="edit-2"
                    label="Edit workspace"
                    onPress={() => openEdit(activeMenuWorkspace)}
                  />
                  <ActionRow
                    icon="trash-2"
                    label="Delete workspace"
                    destructive
                    onPress={() => {
                      setDeletingWorkspace(activeMenuWorkspace);
                      closeMenu();
                    }}
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

      <WorkspaceFormDialog
        visible={formMode !== null}
        mode={formMode ?? 'create'}
        initialValues={
          editingWorkspace
            ? { name: editingWorkspace.name, description: editingWorkspace.description }
            : undefined
        }
        onClose={() => {
          setFormMode(null);
          setEditingWorkspace(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        visible={deletingWorkspace !== null}
        title="Delete workspace"
        message={
          deletingWorkspace
            ? `This will permanently delete "${deletingWorkspace.name}" and all its boards. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onClose={() => setDeletingWorkspace(null)}
        onConfirm={handleConfirmDelete}
      />
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
