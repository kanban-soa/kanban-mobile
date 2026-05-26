import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { ConfirmDialog } from '~/components/confirm-dialog';
import {
  DueDatePickerSheet,
  LabelPickerSheet,
  MemberPickerSheet,
} from '~/components/board/card-quick-actions';
import { LabelManagerModal } from '~/components/board/label-manager-modal';
import { useBoardStore } from '~/store/board.store';

function formatDueDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CardDetailScreen() {
  const { workspaceId, boardId, cardId } = useLocalSearchParams<{
    workspaceId: string;
    boardId: string;
    cardId: string;
  }>();
  const router = useRouter();

  const board = useBoardStore((s) => s.boards[boardId]);
  const members = useBoardStore((s) => s.members);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const toggleCardLabel = useBoardStore((s) => s.toggleCardLabel);
  const toggleCardMember = useBoardStore((s) => s.toggleCardMember);
  const setCardDueDate = useBoardStore((s) => s.setCardDueDate);
  const addLabel = useBoardStore((s) => s.addLabel);
  const updateLabel = useBoardStore((s) => s.updateLabel);
  const deleteLabel = useBoardStore((s) => s.deleteLabel);

  const cardInfo = useMemo(() => {
    if (!board) return null;
    for (const c of board.columns) {
      const task = c.tasks.find((t) => t.id === cardId);
      if (task) return { task, column: c };
    }
    return null;
  }, [board, cardId]);

  const [titleDraft, setTitleDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');

  const [activeSheet, setActiveSheet] = useState<
    'labels' | 'members' | 'dueDate' | null
  >(null);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (cardInfo) {
      setTitleDraft(cardInfo.task.title);
      setDescriptionDraft(cardInfo.task.description);
    }
  }, [cardInfo?.task.title, cardInfo?.task.description]);

  if (!board || !cardInfo) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-muted-foreground mb-4">Card not found.</Text>
        <Button variant="outline" size="sm" onPress={() => router.back()}>
          <Text className="text-foreground">Go back</Text>
        </Button>
      </View>
    );
  }

  const { task, column } = cardInfo;
  const attachedLabels = board.labels.filter((l) => task.labelIds.includes(l.id));
  const assignedMembers = members.filter((m) => task.memberIds.includes(m.id));

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) {
      updateCard(boardId, task.id, { title: trimmed });
    } else {
      setTitleDraft(task.title);
    }
  };

  const commitDescription = () => {
    if (descriptionDraft !== task.description) {
      updateCard(boardId, task.id, { description: descriptionDraft });
    }
  };

  const handleDelete = () => {
    deleteCard(boardId, task.id);
    setIsDeleteOpen(false);
    router.replace(`/workspaces/${workspaceId}/boards/${boardId}`);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center"
          accessibilityLabel="Back"
        >
          <Feather name="arrow-left" size={20} className="text-muted-foreground mr-2" />
          <Text className="text-base text-muted-foreground font-medium">
            {board.title}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          className="p-2"
          accessibilityLabel="Close"
        >
          <Feather name="x" size={20} className="text-muted-foreground" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xs text-muted-foreground mb-2">
          In list <Text className="font-medium text-foreground">{column.title}</Text>
        </Text>

        <TextInput
          value={titleDraft}
          onChangeText={setTitleDraft}
          onBlur={commitTitle}
          placeholder="Card title"
          placeholderTextColor="#888"
          className="text-2xl font-bold text-foreground mb-4"
          multiline
        />

        <Card className="p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Feather name="align-left" size={14} className="text-muted-foreground" />
            <Text className="text-sm font-semibold text-foreground ml-2">Description</Text>
          </View>
          <TextInput
            value={descriptionDraft}
            onChangeText={setDescriptionDraft}
            onBlur={commitDescription}
            placeholder="Add a more detailed description..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
            className="min-h-[80px] text-sm text-foreground"
            style={{ textAlignVertical: 'top' }}
          />
        </Card>

        <Card className="p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Feather name="tag" size={14} className="text-muted-foreground" />
              <Text className="text-sm font-semibold text-foreground ml-2">Labels</Text>
            </View>
            <Pressable
              onPress={() => setActiveSheet('labels')}
              className="flex-row items-center px-2 py-1 rounded-md active:bg-muted"
            >
              <Feather name="plus" size={14} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground ml-1">Edit</Text>
            </Pressable>
          </View>
          {attachedLabels.length === 0 ? (
            <Text className="text-sm text-muted-foreground">No labels.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {attachedLabels.map((label) => (
                <View
                  key={label.id}
                  style={{ backgroundColor: label.color }}
                  className="rounded-full px-3 py-1"
                >
                  <Text className="text-xs text-white font-medium">{label.name}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card className="p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Feather name="users" size={14} className="text-muted-foreground" />
              <Text className="text-sm font-semibold text-foreground ml-2">Members</Text>
            </View>
            <Pressable
              onPress={() => setActiveSheet('members')}
              className="flex-row items-center px-2 py-1 rounded-md active:bg-muted"
            >
              <Feather name="plus" size={14} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground ml-1">Edit</Text>
            </Pressable>
          </View>
          {assignedMembers.length === 0 ? (
            <Text className="text-sm text-muted-foreground">No members assigned.</Text>
          ) : (
            <View>
              {assignedMembers.map((m) => (
                <View key={m.id} className="flex-row items-center py-2">
                  <Avatar className="h-8 w-8 mr-3">
                    {m.avatarUrl && <AvatarImage source={{ uri: m.avatarUrl }} />}
                    <AvatarFallback initials={m.name.charAt(0).toUpperCase()} />
                  </Avatar>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground">{m.name}</Text>
                    <Text className="text-xs text-muted-foreground">{m.email}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card className="p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Feather name="calendar" size={14} className="text-muted-foreground" />
              <Text className="text-sm font-semibold text-foreground ml-2">Due date</Text>
            </View>
            <Pressable
              onPress={() => setActiveSheet('dueDate')}
              className="flex-row items-center px-2 py-1 rounded-md active:bg-muted"
            >
              <Feather name="edit-2" size={14} className="text-muted-foreground" />
              <Text className="text-xs text-muted-foreground ml-1">Edit</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-foreground">
            {task.dueDate ? formatDueDate(task.dueDate) : 'No due date.'}
          </Text>
        </Card>

        <Pressable
          onPress={() => setIsDeleteOpen(true)}
          className="flex-row items-center justify-center mt-4 py-3 rounded-md border border-destructive/30 active:bg-destructive/10"
        >
          <Feather name="trash-2" size={16} className="text-destructive" />
          <Text className="text-sm font-medium text-destructive ml-2">Delete card</Text>
        </Pressable>
      </ScrollView>

      <LabelPickerSheet
        visible={activeSheet === 'labels'}
        onClose={() => setActiveSheet(null)}
        boardLabels={board.labels}
        attachedLabelIds={task.labelIds}
        onToggleLabel={(label) => toggleCardLabel(boardId, task.id, label.id)}
        onOpenManager={() => setIsLabelManagerOpen(true)}
      />

      <MemberPickerSheet
        visible={activeSheet === 'members'}
        onClose={() => setActiveSheet(null)}
        members={members}
        assignedMemberIds={task.memberIds}
        onToggleMember={(memberId) => toggleCardMember(boardId, task.id, memberId)}
      />

      <DueDatePickerSheet
        visible={activeSheet === 'dueDate'}
        onClose={() => setActiveSheet(null)}
        dueDate={task.dueDate}
        onSetDueDate={(value) => setCardDueDate(boardId, task.id, value)}
      />

      <LabelManagerModal
        visible={isLabelManagerOpen}
        labels={board.labels}
        onClose={() => setIsLabelManagerOpen(false)}
        onCreate={(payload) => addLabel(boardId, payload)}
        onUpdate={(id, payload) => updateLabel(boardId, id, payload)}
        onDelete={(id) => deleteLabel(boardId, id)}
      />

      <ConfirmDialog
        visible={isDeleteOpen}
        title="Delete card"
        message="Are you sure? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}
