import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useSurfaceColors } from '~/lib/surface-colors';

export type BoardFormValues = {
  title: string;
  description: string;
};

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  initialValues?: BoardFormValues;
  onClose: () => void;
  onSubmit: (values: BoardFormValues) => void;
};

export function BoardFormDialog({ visible, mode, initialValues, onClose, onSubmit }: Props) {
  const colors = useSurfaceColors();
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');

  useEffect(() => {
    if (visible) {
      setTitle(initialValues?.title ?? '');
      setDescription(initialValues?.description ?? '');
    }
  }, [visible, initialValues?.title, initialValues?.description]);

  const isEdit = mode === 'edit';

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, description: description.trim() });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          className="flex-1 justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={onClose}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="rounded-2xl p-5"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-base font-semibold text-foreground">
                {isEdit ? 'Edit Board' : 'New Board'}
              </Text>
              <Pressable onPress={onClose} className="p-1">
                <Feather name="x" size={18} className="text-muted-foreground" />
              </Pressable>
            </View>
            <Text className="text-xs text-muted-foreground mb-4">
              {isEdit ? 'Update board details.' : 'Create a new board for this workspace.'}
            </Text>

            <Input
              placeholder="Board title…"
              value={title}
              onChangeText={setTitle}
              autoFocus
              className="mb-3"
            />
            <TextInput
              placeholder="Description (optional)…"
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              className="min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground mb-4"
              style={{ textAlignVertical: 'top' }}
            />

            <View className="flex-row justify-end gap-2">
              <Button variant="outline" size="sm" onPress={onClose}>
                <Text className="text-foreground">Cancel</Text>
              </Button>
              <Button size="sm" onPress={handleSubmit} disabled={!title.trim()}>
                <Text className="text-primary-foreground font-semibold">
                  {isEdit ? 'Save changes' : 'Create'}
                </Text>
              </Button>
            </View>
          </View>
        </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
