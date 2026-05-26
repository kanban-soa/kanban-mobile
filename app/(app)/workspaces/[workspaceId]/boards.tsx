import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { ConfirmDialog } from '~/components/confirm-dialog';
import {
  BoardFormDialog,
  type BoardFormValues,
} from '~/components/board/board-form-dialog';
import { WorkspaceBanner } from '~/components/workspace-banner';
import { useSurfaceColors } from '~/lib/surface-colors';

type BoardItem = { id: string; title: string; description: string };

const INITIAL_BOARDS: BoardItem[] = [
  { id: 'default-board', title: 'Product Roadmap', description: 'Q3/Q4 planning and feature tracking.' },
  { id: '2', title: 'Sprint Board', description: 'Current active sprint tasks and issues.' },
  { id: '3', title: 'Design System', description: 'UI components and design tokens.' },
];

export default function BoardsScreen() {
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();
  const colors = useSurfaceColors();

  const [boards, setBoards] = useState<BoardItem[]>(INITIAL_BOARDS);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingBoard, setEditingBoard] = useState<BoardItem | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<BoardItem | null>(null);

  const activeMenuBoard = boards.find((b) => b.id === activeMenuId) ?? null;
  const closeMenu = () => setActiveMenuId(null);

  const openCreate = () => {
    setEditingBoard(null);
    setFormMode('create');
  };

  const openEdit = (board: BoardItem) => {
    setEditingBoard(board);
    setFormMode('edit');
    closeMenu();
  };

  const handleFormSubmit = (values: BoardFormValues) => {
    if (formMode === 'create') {
      setBoards((prev) => [
        { id: Date.now().toString(), title: values.title, description: values.description || 'New board.' },
        ...prev,
      ]);
    } else if (formMode === 'edit' && editingBoard) {
      setBoards((prev) =>
        prev.map((b) =>
          b.id === editingBoard.id
            ? { ...b, title: values.title, description: values.description || b.description }
            : b,
        ),
      );
    }
    setFormMode(null);
    setEditingBoard(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingBoard) return;
    setBoards((prev) => prev.filter((b) => b.id !== deletingBoard.id));
    setDeletingBoard(null);
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

      <FlatList
        data={boards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card className="mb-4 p-5">
            <View className="flex-row items-start justify-between">
              <Link
                href={`/workspaces/${workspaceId}/boards/${item.id}`}
                asChild
                style={{ flex: 1 }}
              >
                <Pressable className="flex-1 pr-2">
                  <Text className="text-lg font-semibold text-foreground mb-1">{item.title}</Text>
                  <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                    {item.description}
                  </Text>
                </Pressable>
              </Link>
              <Pressable
                onPress={() => setActiveMenuId(item.id)}
                accessibilityLabel={`Open actions for ${item.title}`}
                className="p-2"
              >
                <Feather name="more-vertical" size={18} className="text-muted-foreground" />
              </Pressable>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-muted-foreground">No boards found.</Text>
          </View>
        }
      />

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
                    {activeMenuBoard.title}
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
            ? { title: editingBoard.title, description: editingBoard.description }
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
            ? `This will permanently delete "${deletingBoard.title}" and all its contents. This action cannot be undone.`
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
