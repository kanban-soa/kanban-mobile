import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { ConfirmDialog } from '~/components/confirm-dialog';
import {
  DueDatePickerSheet,
  LabelPickerSheet,
  MemberPickerSheet,
  type WorkspaceMember,
} from '~/components/board/card-quick-actions';
import { LabelManagerModal } from '~/components/board/label-manager-modal';
import {
  useAssignCardMember,
  useAttachCardLabel,
  useBoard,
  useCard,
  useClearCardDueDate,
  useCreateLabel,
  useDeleteCard,
  useDeleteLabel,
  useDetachCardLabel,
  useLabels,
  useSetCardDueDate,
  useUnassignCardMember,
  useUpdateCard,
  useUpdateLabel,
} from '~/hooks/use-board';
import { useMembers } from '~/hooks/use-workspaces';
import type { Label as ApiLabel } from '~/lib/api/types';

type DisplayLabel = { id: string; name: string; color: string };

function toDisplayLabel(label: ApiLabel): DisplayLabel {
  return {
    id: label.publicId ?? label.id,
    name: label.name,
    color: label.color ?? label.colourCode ?? '#64748b',
  };
}

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

  const { data: card, isLoading: cardLoading, isError } = useCard(cardId);
  const { data: board } = useBoard(workspaceId, boardId);
  const { data: labelsData = [] } = useLabels(boardId);
  const { data: workspaceMembers = [] } = useMembers(workspaceId ?? '');

  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const attachLabelMutation = useAttachCardLabel();
  const detachLabelMutation = useDetachCardLabel();
  const setDueDateMutation = useSetCardDueDate();
  const clearDueDateMutation = useClearCardDueDate();
  const assignMemberMutation = useAssignCardMember();
  const unassignMemberMutation = useUnassignCardMember();
  const createLabelMutation = useCreateLabel(boardId ?? '');
  const updateLabelMutation = useUpdateLabel(boardId ?? '');
  const deleteLabelMutation = useDeleteLabel(boardId ?? '');

  const labels = useMemo(() => labelsData.map(toDisplayLabel), [labelsData]);
  const members: WorkspaceMember[] = useMemo(
    () =>
      workspaceMembers.map((m) => ({
        id: m.publicId,
        name: m.name?.trim() || m.email.split('@')[0],
        email: m.email,
        avatarUrl: null,
      })),
    [workspaceMembers],
  );

  const cardLabelIds = useMemo(
    () => (card?.labels ?? []).map((l) => l.publicId ?? l.id),
    [card],
  );
  const cardMemberIds = card?.members ?? [];

  const [titleDraft, setTitleDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');

  const [activeSheet, setActiveSheet] = useState<
    'labels' | 'members' | 'dueDate' | null
  >(null);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (card) {
      setTitleDraft(card.title);
      setDescriptionDraft(card.description ?? '');
    }
  }, [card?.title, card?.description, card]);

  if (cardLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !card) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-muted-foreground mb-4">Card not found.</Text>
        <Button variant="outline" size="sm" onPress={() => router.back()}>
          <Text className="text-foreground">Go back</Text>
        </Button>
      </View>
    );
  }

  const boardTitle = board?.title ?? board?.name ?? 'Board';
  const listName = card.list?.name ?? '';
  const attachedLabels = labels.filter((l) => cardLabelIds.includes(l.id));
  const assignedMembers = members.filter((m) => cardMemberIds.includes(m.id));

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== card.title) {
      updateCardMutation.mutate({
        cardId: card.publicId ?? card.id,
        payload: { title: trimmed },
      });
    } else {
      setTitleDraft(card.title);
    }
  };

  const commitDescription = () => {
    const next = descriptionDraft;
    if (next !== (card.description ?? '')) {
      updateCardMutation.mutate({
        cardId: card.publicId ?? card.id,
        payload: { description: next },
      });
    }
  };

  const handleDelete = () => {
    deleteCardMutation.mutate(card.publicId ?? card.id, {
      onSettled: () => {
        setIsDeleteOpen(false);
        router.replace(`/workspaces/${workspaceId}/boards/${boardId}`);
      },
    });
  };

  const activeCardId = card.publicId ?? card.id;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center"
          accessibilityLabel="Back"
        >
          <Feather name="arrow-left" size={20} className="text-muted-foreground mr-2" />
          <Text className="text-base text-muted-foreground font-medium">{boardTitle}</Text>
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
        {listName ? (
          <Text className="text-xs text-muted-foreground mb-2">
            In list <Text className="font-medium text-foreground">{listName}</Text>
          </Text>
        ) : null}

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
            {card.dueDate ? formatDueDate(card.dueDate) : 'No due date.'}
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
        boardLabels={labels}
        attachedLabelIds={cardLabelIds}
        onToggleLabel={(label, isAttached) => {
          if (isAttached) {
            detachLabelMutation.mutate({ cardId: activeCardId, labelId: label.id });
          } else {
            attachLabelMutation.mutate({ cardId: activeCardId, labelId: label.id });
          }
        }}
        onOpenManager={() => setIsLabelManagerOpen(true)}
      />

      <MemberPickerSheet
        visible={activeSheet === 'members'}
        onClose={() => setActiveSheet(null)}
        members={members}
        assignedMemberIds={cardMemberIds}
        onToggleMember={(memberId, isAssigned) => {
          if (isAssigned) {
            unassignMemberMutation.mutate({ cardId: activeCardId, memberId });
          } else {
            assignMemberMutation.mutate({
              cardId: activeCardId,
              workspaceMemberPublicId: memberId,
            });
          }
        }}
      />

      <DueDatePickerSheet
        visible={activeSheet === 'dueDate'}
        onClose={() => setActiveSheet(null)}
        dueDate={card.dueDate ?? null}
        onSetDueDate={(value) => {
          if (value === null) {
            clearDueDateMutation.mutate(activeCardId);
          } else {
            setDueDateMutation.mutate({
              cardId: activeCardId,
              dueDate: new Date(value).toISOString(),
            });
          }
        }}
      />

      <LabelManagerModal
        visible={isLabelManagerOpen}
        labels={labels}
        onClose={() => setIsLabelManagerOpen(false)}
        onCreate={(payload) =>
          createLabelMutation.mutate({ name: payload.name, colourCode: payload.color })
        }
        onUpdate={(id, payload) =>
          updateLabelMutation.mutate({
            labelId: id,
            payload: { name: payload.name, colourCode: payload.color },
          })
        }
        onDelete={(id) => deleteLabelMutation.mutate(id)}
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
