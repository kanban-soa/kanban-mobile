import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useSurfaceColors } from '~/lib/surface-colors';

export type BoardLabel = {
  id: string;
  name: string;
  color: string;
};

export const LABEL_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
];

type Props = {
  visible: boolean;
  labels: BoardLabel[];
  onClose: () => void;
  onCreate: (label: Omit<BoardLabel, 'id'>) => void;
  onUpdate: (id: string, payload: Omit<BoardLabel, 'id'>) => void;
  onDelete: (id: string) => void;
};

export function LabelManagerModal({
  visible,
  labels,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const colors = useSurfaceColors();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(LABEL_COLORS[0]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(LABEL_COLORS[0]);

  useEffect(() => {
    if (!visible) {
      setEditingId(null);
      setConfirmDeleteId(null);
      setIsCreating(false);
      setNewName('');
      setNewColor(LABEL_COLORS[0]);
    }
  }, [visible]);

  const beginEdit = (label: BoardLabel) => {
    setEditingId(label.id);
    setEditName(label.name);
    setEditColor(label.color);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor(LABEL_COLORS[0]);
  };

  const saveEdit = (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    onUpdate(id, { name: trimmed, color: editColor });
    cancelEdit();
  };

  const saveCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setIsCreating(false);
      return;
    }
    onCreate({ name: trimmed, color: newColor });
    setNewName('');
    setNewColor(LABEL_COLORS[0]);
    setIsCreating(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  Manage labels
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Edit or delete labels for this board.
                </Text>
              </View>
              <Pressable onPress={onClose} className="p-1">
                <Feather name="x" size={20} className="text-muted-foreground" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {labels.length === 0 && !isCreating ? (
                <View className="py-6 items-center">
                  <Text className="text-sm text-muted-foreground">
                    No labels yet. Create one below.
                  </Text>
                </View>
              ) : (
                labels.map((label) => {
                  const isEditing = editingId === label.id;
                  const isConfirming = confirmDeleteId === label.id;

                  if (isEditing) {
                    return (
                      <View
                        key={label.id}
                        className="rounded-md border border-border p-3 mb-2"
                      >
                        <View className="flex-row flex-wrap gap-2 mb-3">
                          {LABEL_COLORS.map((c) => {
                            const isSelected = editColor === c;
                            return (
                              <Pressable
                                key={c}
                                onPress={() => setEditColor(c)}
                                style={{
                                  backgroundColor: c,
                                  width: 24,
                                  height: 24,
                                  borderRadius: 12,
                                  borderWidth: isSelected ? 2 : 0,
                                  borderColor: '#000',
                                  transform: [{ scale: isSelected ? 1.1 : 1 }],
                                }}
                              />
                            );
                          })}
                        </View>
                        <Input
                          value={editName}
                          onChangeText={setEditName}
                          placeholder="Label name"
                          autoFocus
                          className="mb-3"
                        />
                        <View className="flex-row justify-end gap-2">
                          <Button variant="ghost" size="sm" onPress={cancelEdit}>
                            <Text className="text-muted-foreground">Cancel</Text>
                          </Button>
                          <Button size="sm" onPress={() => saveEdit(label.id)}>
                            <Text className="text-white">Save</Text>
                          </Button>
                        </View>
                      </View>
                    );
                  }

                  return (
                    <View
                      key={label.id}
                      className="flex-row items-center justify-between rounded-md border border-border px-3 py-2 mb-2"
                    >
                      <View className="flex-row items-center flex-1 min-w-0">
                        <View
                          style={{
                            backgroundColor: label.color,
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            marginRight: 8,
                          }}
                        />
                        <Text className="text-sm text-foreground" numberOfLines={1}>
                          {label.name}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        {isConfirming ? (
                          <>
                            <Text className="text-xs text-muted-foreground mr-2">
                              Delete?
                            </Text>
                            <Pressable
                              onPress={() => setConfirmDeleteId(null)}
                              className="p-1.5 rounded-md"
                            >
                              <Feather
                                name="x"
                                size={16}
                                className="text-muted-foreground"
                              />
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                onDelete(label.id);
                                setConfirmDeleteId(null);
                              }}
                              className="p-1.5 rounded-md bg-destructive ml-1"
                            >
                              <Feather name="check" size={16} color="#fff" />
                            </Pressable>
                          </>
                        ) : (
                          <>
                            <Pressable
                              onPress={() => beginEdit(label)}
                              className="p-1.5 rounded-md"
                            >
                              <Feather
                                name="edit-2"
                                size={14}
                                className="text-muted-foreground"
                              />
                            </Pressable>
                            <Pressable
                              onPress={() => setConfirmDeleteId(label.id)}
                              className="p-1.5 rounded-md ml-1"
                            >
                              <Feather
                                name="trash-2"
                                size={14}
                                className="text-destructive"
                              />
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                  );
                })
              )}

              {isCreating ? (
                <View className="rounded-md border border-border p-3 mb-2">
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {LABEL_COLORS.map((c) => {
                      const isSelected = newColor === c;
                      return (
                        <Pressable
                          key={c}
                          onPress={() => setNewColor(c)}
                          style={{
                            backgroundColor: c,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: isSelected ? 2 : 0,
                            borderColor: '#000',
                            transform: [{ scale: isSelected ? 1.1 : 1 }],
                          }}
                        />
                      );
                    })}
                  </View>
                  <Input
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Label name"
                    autoFocus
                    className="mb-3"
                  />
                  <View className="flex-row justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        setIsCreating(false);
                        setNewName('');
                      }}
                    >
                      <Text className="text-muted-foreground">Cancel</Text>
                    </Button>
                    <Button size="sm" onPress={saveCreate}>
                      <Text className="text-white">Create</Text>
                    </Button>
                  </View>
                </View>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setIsCreating(true)}
                  className="mt-1"
                >
                  <Text className="text-foreground">+ New label</Text>
                </Button>
              )}
            </ScrollView>

            <View className="flex-row justify-end mt-4">
              <Button variant="outline" size="sm" onPress={onClose}>
                <Text className="text-foreground">Close</Text>
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
