import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { ConfirmDialog } from '~/components/confirm-dialog';
import {
  BoardFormDialog,
  type BoardFormValues,
} from '~/components/board/board-form-dialog';
import { WorkspaceBanner } from '~/components/workspace-banner';
import {
  useBoards,
  useCreateBoard,
  useDeleteBoard,
  useUpdateBoard,
} from '~/hooks/use-board';
import { useSurfaceColors } from '~/lib/surface-colors';
import type { Board } from '~/lib/api/types';

export default function BoardsScreen() {
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();
  const colors = useSurfaceColors();

  const { data: boards = [], isLoading, isError, refetch, isRefetching } =
    useBoards(workspaceId);
  const createMutation = useCreateBoard(workspaceId ?? '');
  const updateMutation = useUpdateBoard(workspaceId ?? '');
  const deleteMutation = useDeleteBoard(workspaceId ?? '');

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  const activeMenuBoard = boards.find((b) => b.publicId === activeMenuId) ?? null;
  const closeMenu = () => setActiveMenuId(null);

  const openCreate = () => {
    setEditingBoard(null);
    setFormMode('create');
  };

  const openEdit = (board: Board) => {
    setEditingBoard(board);
    setFormMode('edit');
    closeMenu();
  };

  const handleFormSubmit = async (values: BoardFormValues) => {
    try {
      if (formMode === 'create') {
        await createMutation.mutateAsync({
          title: values.title,
          description: values.description || undefined,
        });
      } else if (formMode === 'edit' && editingBoard) {
        await updateMutation.mutateAsync({
          boardId: editingBoard.publicId,
          payload: {
            title: values.title,
            description: values.description || undefined,
          },
        });
      }
      setFormMode(null);
      setEditingBoard(null);
    } catch (err) {
      console.error('Board save failed', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBoard) return;
    try {
      await deleteMutation.mutateAsync(deletingBoard.publicId);
    } catch (err) {
      console.error('Board delete failed', err);
    } finally {
      setDeletingBoard(null);
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      <WorkspaceBanner />
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-foreground">Boards</Text>
        <Button
          size="sm"
          variant="outline"
          onPress={openCreate}
          className="rounded-full w-10 h-10 p-0"
        >
          <Feather name="plus" size={20} className="text-foreground" />
        </Button>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={boards}
          keyExtractor={(item) => item.publicId}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          renderItem={({ item }) => (
            <Card className="mb-4 p-5">
              <View className="flex-row items-start justify-between">
                <Link
                  href={`/workspaces/${workspaceId}/boards/${item.publicId}`}
                  asChild
                  style={{ flex: 1 }}
                >
                  <Pressable className="flex-1 pr-2">
                    <Text className="text-lg font-semibold text-foreground mb-1">
                      {item.title ?? item.name}
                    </Text>
                    <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                      {item.description ?? 'No description.'}
                    </Text>
                  </Pressable>
                </Link>
                <Pressable
                  onPress={() => setActiveMenuId(item.publicId)}
                  accessibilityLabel={`Open actions for ${item.title ?? item.name}`}
                  className="p-2"
                >
                  <Feather name="more-vertical" size={18} className="text-muted-foreground" />
                </Pressable>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-muted-foreground">
                {isError ? 'Failed to load boards.' : 'No boards found.'}
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={activeMenuBoard !== null}
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
              {activeMenuBoard && (
                <>
                  <View
                    className="self-center w-10 h-1 rounded-full mb-4"
                    style={{ backgroundColor: colors.border }}
                  />
                  <Text className="text-base font-semibold text-foreground mb-4">
                    {activeMenuBoard.title ?? activeMenuBoard.name}
                  </Text>

                  <ActionRow
                    icon="edit-2"
                    label="Edit board"
                    onPress={() => openEdit(activeMenuBoard)}
                  />
                  <ActionRow
                    icon="trash-2"
                    label="Delete board"
                    destructive
                    onPress={() => {
                      setDeletingBoard(activeMenuBoard);
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

      <BoardFormDialog
        visible={formMode !== null}
        mode={formMode ?? 'create'}
        initialValues={
          editingBoard
            ? {
                title: editingBoard.title ?? editingBoard.name,
                description: editingBoard.description ?? '',
              }
            : undefined
        }
        onClose={() => {
          setFormMode(null);
          setEditingBoard(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        visible={deletingBoard !== null}
        title="Delete board"
        message={
          deletingBoard
            ? `This will permanently delete "${deletingBoard.title ?? deletingBoard.name}" and all its contents. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onClose={() => setDeletingBoard(null)}
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
