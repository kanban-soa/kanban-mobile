import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useSurfaceColors } from '~/lib/surface-colors';

import type { BoardLabel } from './label-manager-modal';

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

type BasePickerProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

function PickerSheet({ visible, onClose, title, children }: BasePickerProps) {
  const colors = useSurfaceColors();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
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
            <View
              className="self-center w-10 h-1 rounded-full mb-4"
              style={{ backgroundColor: colors.border }}
            />
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-foreground">
                {title}
              </Text>
              <Pressable onPress={onClose} className="p-1">
                <Feather name="x" size={20} className="text-muted-foreground" />
              </Pressable>
            </View>
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function LabelPickerSheet({
  visible,
  onClose,
  boardLabels,
  attachedLabelIds,
  onToggleLabel,
  onOpenManager,
}: {
  visible: boolean;
  onClose: () => void;
  boardLabels: BoardLabel[];
  attachedLabelIds: string[];
  onToggleLabel: (label: BoardLabel, isAttached: boolean) => void;
  onOpenManager: () => void;
}) {
  return (
    <PickerSheet visible={visible} onClose={onClose} title="Labels">
      <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
        {boardLabels.length === 0 ? (
          <Text className="text-sm text-muted-foreground py-4 text-center">
            No labels yet.
          </Text>
        ) : (
          boardLabels.map((label) => {
            const isAttached = attachedLabelIds.includes(label.id);
            return (
              <Pressable
                key={label.id}
                onPress={() => onToggleLabel(label, isAttached)}
                className="flex-row items-center justify-between px-2 py-3 rounded-md active:bg-muted"
              >
                <View className="flex-row items-center flex-1">
                  <View
                    style={{
                      backgroundColor: label.color,
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      marginRight: 10,
                    }}
                  />
                  <Text className="text-sm text-foreground">{label.name}</Text>
                </View>
                {isAttached && (
                  <Feather
                    name="check"
                    size={16}
                    className="text-muted-foreground"
                  />
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <View className="mt-3 pt-3 border-t border-border">
        <Pressable
          onPress={() => {
            onClose();
            onOpenManager();
          }}
          className="flex-row items-center py-2"
        >
          <Feather name="settings" size={16} className="text-muted-foreground mr-2" />
          <Text className="text-sm text-foreground">Manage labels...</Text>
        </Pressable>
      </View>
    </PickerSheet>
  );
}

export function MemberPickerSheet({
  visible,
  onClose,
  members,
  assignedMemberIds,
  onToggleMember,
}: {
  visible: boolean;
  onClose: () => void;
  members: WorkspaceMember[];
  assignedMemberIds: string[];
  onToggleMember: (memberId: string, isAssigned: boolean) => void;
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) setQuery('');
  }, [visible]);

  const filtered = members.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    );
  });

  return (
    <PickerSheet visible={visible} onClose={onClose} title="Members">
      <Input
        placeholder="Search members"
        value={query}
        onChangeText={setQuery}
        className="mb-3"
      />
      <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text className="text-sm text-muted-foreground py-4 text-center">
            No matches.
          </Text>
        ) : (
          filtered.map((m) => {
            const isAssigned = assignedMemberIds.includes(m.id);
            return (
              <Pressable
                key={m.id}
                onPress={() => onToggleMember(m.id, isAssigned)}
                className="flex-row items-center justify-between px-1 py-2 rounded-md active:bg-muted"
              >
                <View className="flex-row items-center flex-1">
                  <Avatar className="h-8 w-8 mr-3">
                    {m.avatarUrl && <AvatarImage source={{ uri: m.avatarUrl }} />}
                    <AvatarFallback initials={m.name.charAt(0).toUpperCase()} />
                  </Avatar>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">
                      {m.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">{m.email}</Text>
                  </View>
                </View>
                {isAssigned && (
                  <Feather
                    name="check"
                    size={16}
                    className="text-muted-foreground"
                  />
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </PickerSheet>
  );
}

export function DueDatePickerSheet({
  visible,
  onClose,
  dueDate,
  onSetDueDate,
}: {
  visible: boolean;
  onClose: () => void;
  dueDate: string | null;
  onSetDueDate: (value: string | null) => void;
}) {
  const [value, setValue] = useState(dueDate ?? '');

  useEffect(() => {
    if (visible) setValue(dueDate ?? '');
  }, [visible, dueDate]);

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value.trim());

  return (
    <PickerSheet visible={visible} onClose={onClose} title="Due date">
      <Text className="text-xs text-muted-foreground mb-2">
        Format: YYYY-MM-DD
      </Text>
      <Input
        placeholder="2026-01-31"
        value={value}
        onChangeText={setValue}
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        autoCorrect={false}
        className="mb-3"
      />
      <View className="flex-row gap-2">
        <Button
          className="flex-1"
          onPress={() => {
            if (isValidDate) {
              onSetDueDate(value.trim());
              onClose();
            }
          }}
          disabled={!isValidDate}
        >
          <Text className="text-primary-foreground font-semibold">Save</Text>
        </Button>
        {dueDate && (
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => {
              onSetDueDate(null);
              onClose();
            }}
          >
            <Text className="text-foreground font-medium">Clear</Text>
          </Button>
        )}
      </View>
    </PickerSheet>
  );
}
