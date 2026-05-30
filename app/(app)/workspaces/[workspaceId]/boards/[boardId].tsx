import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useQueryClient } from '@tanstack/react-query';

import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { LabelManagerModal } from '~/components/board/label-manager-modal';
import {
  DueDatePickerSheet,
  LabelPickerSheet,
  MemberPickerSheet,
  type WorkspaceMember,
} from '~/components/board/card-quick-actions';
import { ConfirmDialog } from '~/components/confirm-dialog';
import {
  useAssignCardMember,
  useAttachCardLabel,
  useBoard,
  useClearCardDueDate,
  useCreateCard,
  useCreateLabel,
  useCreateList,
  useDeleteLabel,
  useDeleteList,
  useDetachCardLabel,
  useLabels,
  useMoveCard,
  useSetCardDueDate,
  useUnassignCardMember,
  useUpdateBoard,
  useUpdateLabel,
} from '~/hooks/use-board';
import { useMembers } from '~/hooks/use-workspaces';
import type {
  Board as ApiBoard,
  BoardList as ApiBoardList,
  Card as ApiCard,
  Label as ApiLabel,
} from '~/lib/api/types';

type DisplayLabel = {
  id: string;
  name: string;
  color: string;
};

function toDisplayLabel(label: ApiLabel): DisplayLabel {
  return {
    id: label.publicId ?? label.id,
    name: label.name,
    color: label.color ?? label.colourCode ?? '#64748b',
  };
}

function listPublicId(list: ApiBoardList): string {
  return list.publicId ?? String(list.id);
}

function cardPublicId(card: ApiCard): string {
  return card.publicId ?? card.id;
}

function formatDueDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function cardLabelIds(card: ApiCard): string[] {
  return (card.labels ?? []).map((l) => l.publicId ?? l.id);
}

function cardMemberIds(card: ApiCard): string[] {
  return card.members ?? [];
}

function DraggableCard({
  card,
  sourceListId,
  labels,
  members,
  onDrop,
  onOpenLabels,
  onOpenMembers,
  onOpenDueDate,
  onOpenCard,
}: {
  card: ApiCard;
  sourceListId: string;
  labels: DisplayLabel[];
  members: WorkspaceMember[];
  onDrop: (cardId: string, sourceListId: string, x: number, y: number) => void;
  onOpenLabels: (cardId: string, sourceListId: string) => void;
  onOpenMembers: (cardId: string, sourceListId: string) => void;
  onOpenDueDate: (cardId: string, sourceListId: string) => void;
  onOpenCard: (cardId: string) => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const zIndex = useSharedValue(1);

  const cardId = cardPublicId(card);

  const handleDragEnd = (id: string, sourceColId: string, absX: number, absY: number) => {
    onDrop(id, sourceColId, absX, absY);
  };

  const pan = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      isDragging.value = true;
      zIndex.value = 100;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      isDragging.value = false;
      runOnJS(handleDragEnd)(cardId, sourceListId, event.absoluteX, event.absoluteY);
      translateX.value = withSpring(0, {}, () => {
        zIndex.value = 1;
      });
      translateY.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: withSpring(isDragging.value ? 1.05 : 1) },
        { rotate: withSpring(isDragging.value ? '2deg' : '0deg') },
      ],
      zIndex: zIndex.value,
      elevation: isDragging.value ? 5 : 0,
      opacity: isDragging.value ? 0.9 : 1,
    };
  });

  const labelIds = cardLabelIds(card);
  const memberIds = cardMemberIds(card);
  const attachedLabels = labels.filter((l) => labelIds.includes(l.id));
  const assignedMembers = members.filter((m) => memberIds.includes(m.id));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>
        <Card className="mb-3 p-3 bg-card border-border">
          <Pressable onPress={() => onOpenCard(cardId)}>
            {attachedLabels.length > 0 && (
              <View className="flex-row flex-wrap gap-1 mb-2">
                {attachedLabels.slice(0, 3).map((label) => (
                  <View
                    key={label.id}
                    style={{ backgroundColor: label.color }}
                    className="rounded-full px-2 py-0.5"
                  >
                    <Text className="text-[10px] text-white font-medium">{label.name}</Text>
                  </View>
                ))}
                {attachedLabels.length > 3 && (
                  <Text className="text-[10px] text-muted-foreground self-center">
                    +{attachedLabels.length - 3}
                  </Text>
                )}
              </View>
            )}

            <Text className="text-base font-medium text-foreground mb-2">{card.title}</Text>

            <View className="flex-row items-center justify-between">
              {assignedMembers.length > 0 ? (
                <View className="flex-row items-center">
                  {assignedMembers.slice(0, 3).map((m, i) => (
                    <View
                      key={m.id}
                      className="h-6 w-6 rounded-full bg-muted items-center justify-center border-2 border-card"
                      style={{ marginLeft: i === 0 ? 0 : -8 }}
                    >
                      <Text className="text-[10px] font-medium text-foreground uppercase">
                        {m.name.charAt(0)}
                      </Text>
                    </View>
                  ))}
                  {assignedMembers.length > 3 && (
                    <Text className="text-[10px] text-muted-foreground ml-1">
                      +{assignedMembers.length - 3}
                    </Text>
                  )}
                </View>
              ) : (
                <View />
              )}
              {card.dueDate && (
                <View className="flex-row items-center">
                  <Feather name="calendar" size={12} className="text-muted-foreground" />
                  <Text className="text-[11px] text-muted-foreground ml-1">
                    {formatDueDate(card.dueDate)}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

          <View className="flex-row items-center mt-2 pt-2 border-t border-border gap-2">
            <Pressable
              onPress={() => onOpenLabels(cardId, sourceListId)}
              className="flex-row items-center px-2 py-1 rounded-md active:bg-muted"
              accessibilityLabel="Edit labels"
            >
              <Feather name="tag" size={12} className="text-muted-foreground" />
              <Text className="text-[11px] text-muted-foreground ml-1">Labels</Text>
            </Pressable>
            <Pressable
              onPress={() => onOpenMembers(cardId, sourceListId)}
              className="flex-row items-center px-2 py-1 rounded-md active:bg-muted"
              accessibilityLabel="Edit assignees"
            >
              <Feather name="user-plus" size={12} className="text-muted-foreground" />
              <Text className="text-[11px] text-muted-foreground ml-1">Assign</Text>
            </Pressable>
            <Pressable
              onPress={() => onOpenDueDate(cardId, sourceListId)}
              className="flex-row items-center px-2 py-1 rounded-md active:bg-muted"
              accessibilityLabel="Edit due date"
            >
              <Feather name="calendar" size={12} className="text-muted-foreground" />
              <Text className="text-[11px] text-muted-foreground ml-1">Date</Text>
            </Pressable>
          </View>
        </Card>
      </Animated.View>
    </GestureDetector>
  );
}

export default function BoardScreen() {
  const { workspaceId, boardId } = useLocalSearchParams<{
    workspaceId: string;
    boardId: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: board, isLoading: boardLoading, isError } = useBoard(workspaceId, boardId);
  const { data: labelsData = [] } = useLabels(boardId);
  const { data: workspaceMembers = [] } = useMembers(workspaceId ?? '');

  const boardKey = useMemo(
    () => ['workspaces', workspaceId, 'boards', boardId] as const,
    [workspaceId, boardId],
  );
  const labelsKey = useMemo(
    () => ['boards', boardId, 'labels'] as const,
    [boardId],
  );

  const patchBoard = useCallback(
    (updater: (lists: ApiBoardList[]) => ApiBoardList[]) => {
      queryClient.setQueryData<ApiBoard>(boardKey, (prev) => {
        if (!prev) return prev;
        if (prev.lists) return { ...prev, lists: updater(prev.lists) };
        if (prev.allLists) return { ...prev, allLists: updater(prev.allLists) };
        return { ...prev, lists: updater([]) };
      });
    },
    [queryClient, boardKey],
  );

  const patchBoardMeta = useCallback(
    (updater: (b: ApiBoard) => ApiBoard) => {
      queryClient.setQueryData<ApiBoard>(boardKey, (prev) => (prev ? updater(prev) : prev));
    },
    [queryClient, boardKey],
  );

  const patchLabels = useCallback(
    (updater: (labels: ApiLabel[]) => ApiLabel[]) => {
      queryClient.setQueryData<ApiLabel[]>(labelsKey, (prev) =>
        prev ? updater(prev) : prev,
      );
    },
    [queryClient, labelsKey],
  );

  const rollbackBoard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: boardKey });
  }, [queryClient, boardKey]);

  const rollbackLabels = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: labelsKey });
  }, [queryClient, labelsKey]);

  const updateBoardMutation = useUpdateBoard(workspaceId ?? '');
  const createListMutation = useCreateList(boardId ?? '');
  const deleteListMutation = useDeleteList();
  const createCardMutation = useCreateCard();
  const moveCardMutation = useMoveCard();
  const attachLabelMutation = useAttachCardLabel();
  const detachLabelMutation = useDetachCardLabel();
  const setDueDateMutation = useSetCardDueDate();
  const clearDueDateMutation = useClearCardDueDate();
  const assignMemberMutation = useAssignCardMember();
  const unassignMemberMutation = useUnassignCardMember();
  const createLabelMutation = useCreateLabel(boardId ?? '');
  const updateLabelMutation = useUpdateLabel(boardId ?? '');
  const deleteLabelMutation = useDeleteLabel(boardId ?? '');

  const lists = useMemo(() => {
    const raw = board?.lists ?? board?.allLists ?? [];
    return [...raw].sort((a, b) => {
      const ap = a.position ?? a.index ?? 0;
      const bp = b.position ?? b.index ?? 0;
      return ap - bp;
    });
  }, [board]);

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

  const boardTitle = board?.title ?? board?.name ?? '';

  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    if (board) setEditingTitle(boardTitle);
  }, [boardTitle, board]);

  const [scrollX, setScrollX] = useState(0);

  const [addingCardTo, setAddingCardTo] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [activeCardRef, setActiveCardRef] = useState<
    | { cardId: string; listId: string; type: 'labels' | 'members' | 'dueDate' }
    | null
  >(null);

  const activeCard = useMemo<ApiCard | null>(() => {
    if (!activeCardRef) return null;
    const list = lists.find((l) => listPublicId(l) === activeCardRef.listId);
    return list?.cards?.find((c) => cardPublicId(c) === activeCardRef.cardId) ?? null;
  }, [activeCardRef, lists]);

  const handleDrop = (cardId: string, sourceListId: string, absoluteX: number) => {
    const targetX = absoluteX - 16 + scrollX;
    const colIndex = Math.floor(targetX / 304);
    if (colIndex < 0 || colIndex >= lists.length) return;
    const targetListId = listPublicId(lists[colIndex]);
    if (targetListId === sourceListId) return;
    let movingCard: ApiCard | undefined;
    patchBoard((currentLists) => {
      const withoutCard = currentLists.map((l) => {
        if (listPublicId(l) !== sourceListId) return l;
        const found = (l.cards ?? []).find((c) => cardPublicId(c) === cardId);
        if (found) movingCard = found;
        return { ...l, cards: (l.cards ?? []).filter((c) => cardPublicId(c) !== cardId) };
      });
      if (!movingCard) return currentLists;
      return withoutCard.map((l) =>
        listPublicId(l) === targetListId
          ? { ...l, cards: [...(l.cards ?? []), { ...movingCard!, listId: targetListId }] }
          : l,
      );
    });
    moveCardMutation.mutate(
      { cardId, payload: { targetListId } },
      { onError: rollbackBoard },
    );
  };

  const cardSubmitLockRef = useRef<string | null>(null);
  const listSubmitLockRef = useRef(false);

  const handleAddCardSubmit = (listId: string) => {
    if (cardSubmitLockRef.current === listId) return;
    const trimmed = newCardTitle.trim();
    if (!trimmed) {
      setAddingCardTo(null);
      return;
    }
    cardSubmitLockRef.current = listId;
    const tempId = `tmp-card-${Date.now()}`;
    patchBoard((currentLists) =>
      currentLists.map((l) =>
        listPublicId(l) === listId
          ? {
              ...l,
              cards: [
                ...(l.cards ?? []),
                {
                  id: tempId,
                  publicId: tempId,
                  title: trimmed,
                  listId,
                  labels: [],
                  members: [],
                } as ApiCard,
              ],
            }
          : l,
      ),
    );
    setNewCardTitle('');
    setAddingCardTo(null);
    createCardMutation.mutate(
      { listId, payload: { title: trimmed } },
      {
        onError: rollbackBoard,
        onSettled: () => {
          cardSubmitLockRef.current = null;
        },
      },
    );
  };

  const handleAddListSubmit = () => {
    if (listSubmitLockRef.current) return;
    const trimmed = newListTitle.trim();
    if (!trimmed) {
      setIsAddingList(false);
      return;
    }
    listSubmitLockRef.current = true;
    const tempId = `tmp-list-${Date.now()}`;
    patchBoard((currentLists) => [
      ...currentLists,
      {
        id: tempId,
        publicId: tempId,
        name: trimmed,
        boardId: boardId ?? '',
        cards: [],
        position: (currentLists[currentLists.length - 1]?.position ?? currentLists.length) + 1,
      },
    ]);
    setNewListTitle('');
    setIsAddingList(false);
    createListMutation.mutate(
      { name: trimmed },
      {
        onError: rollbackBoard,
        onSettled: () => {
          listSubmitLockRef.current = false;
        },
      },
    );
  };

  const commitTitleEdit = () => {
    const trimmed = editingTitle.trim();
    if (trimmed && trimmed !== boardTitle && boardId) {
      patchBoardMeta((b) => ({ ...b, title: trimmed, name: trimmed }));
      updateBoardMutation.mutate(
        { boardId, payload: { title: trimmed } },
        { onError: rollbackBoard },
      );
    } else {
      setEditingTitle(boardTitle);
    }
    setIsEditingBoardName(false);
  };

  const onOpenCard = (cardId: string) => {
    router.push(`/workspaces/${workspaceId}/boards/${boardId}/cards/${cardId}`);
  };

  if (boardLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !board) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-muted-foreground mb-4">Could not load board.</Text>
        <Button variant="outline" size="sm" onPress={() => router.back()}>
          <Text className="text-foreground">Go back</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <Pressable onPress={() => router.back()} className="flex-row items-center mb-4">
        <Feather name="arrow-left" size={20} className="text-muted-foreground mr-2" />
        <Text className="text-base text-muted-foreground font-medium">Back to Boards</Text>
      </Pressable>

      <View className="flex-row items-start justify-between mb-1">
        <View className="flex-1 pr-2">
          {isEditingBoardName ? (
            <Input
              className="text-2xl font-bold h-12 mb-1 px-0 border-transparent focus:border-transparent bg-transparent"
              value={editingTitle}
              onChangeText={setEditingTitle}
              autoFocus
              onBlur={commitTitleEdit}
              onSubmitEditing={commitTitleEdit}
            />
          ) : (
            <Pressable onPress={() => setIsEditingBoardName(true)}>
              <Text className="text-2xl font-bold text-foreground mb-1">{boardTitle}</Text>
            </Pressable>
          )}
          {board.description ? (
            <Text className="text-sm text-muted-foreground" numberOfLines={2}>
              {board.description}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => setIsLabelManagerOpen(true)}
          className="flex-row items-center px-3 py-2 rounded-md border border-border active:bg-muted"
          accessibilityLabel="Manage labels"
        >
          <Feather name="tag" size={14} className="text-muted-foreground" />
          <Text className="text-xs text-foreground ml-1.5 font-medium">Manage labels</Text>
        </Pressable>
      </View>

      <View className="mb-6" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-1 overflow-visible"
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
      >
        <View className="flex-row gap-4 pb-4">
          {lists.map((list) => {
            const lid = listPublicId(list);
            const cards = list.cards ?? [];
            return (
              <View key={lid} className="w-72 bg-muted/30 rounded-lg p-3 h-auto max-h-full">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-semibold text-foreground">{list.name}</Text>
                  <View className="flex-row items-center">
                    <View className="bg-muted px-2 py-0.5 rounded-full mr-2">
                      <Text className="text-xs font-medium text-muted-foreground">
                        {cards.length}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => setDeletingListId(lid)}
                      className="p-1"
                      accessibilityLabel={`Delete list ${list.name}`}
                    >
                      <Feather name="trash-2" size={16} className="text-muted-foreground" />
                    </Pressable>
                  </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'visible' }}>
                  {cards.map((card) => (
                    <DraggableCard
                      key={cardPublicId(card)}
                      card={card}
                      sourceListId={lid}
                      labels={labels}
                      members={members}
                      onDrop={handleDrop}
                      onOpenLabels={(cid, lid2) =>
                        setActiveCardRef({ cardId: cid, listId: lid2, type: 'labels' })
                      }
                      onOpenMembers={(cid, lid2) =>
                        setActiveCardRef({ cardId: cid, listId: lid2, type: 'members' })
                      }
                      onOpenDueDate={(cid, lid2) =>
                        setActiveCardRef({ cardId: cid, listId: lid2, type: 'dueDate' })
                      }
                      onOpenCard={onOpenCard}
                    />
                  ))}

                  {addingCardTo === lid ? (
                    <View className="mt-1">
                      <Input
                        autoFocus
                        placeholder="What needs to be done?"
                        value={newCardTitle}
                        onChangeText={setNewCardTitle}
                        onSubmitEditing={() => handleAddCardSubmit(lid)}
                        onBlur={() => handleAddCardSubmit(lid)}
                        className="bg-card border-border"
                      />
                    </View>
                  ) : (
                    <Button
                      variant="ghost"
                      className="mt-1 justify-start px-2 h-10"
                      onPress={() => {
                        setAddingCardTo(lid);
                        setNewCardTitle('');
                      }}
                    >
                      <Text className="text-muted-foreground">+ Add a card</Text>
                    </Button>
                  )}
                </ScrollView>
              </View>
            );
          })}

          {isAddingList ? (
            <View className="w-72 bg-muted/30 rounded-lg p-3 h-fit">
              <Input
                autoFocus
                placeholder="Enter list title..."
                value={newListTitle}
                onChangeText={setNewListTitle}
                onSubmitEditing={handleAddListSubmit}
                onBlur={handleAddListSubmit}
                className="bg-card border-border mb-2"
              />
              <View className="flex-row items-center justify-between">
                <Button variant="default" size="sm" onPress={handleAddListSubmit}>
                  <Text className="text-primary-foreground">Add List</Text>
                </Button>
                <Button variant="ghost" size="sm" onPress={() => setIsAddingList(false)}>
                  <Text className="text-muted-foreground">Cancel</Text>
                </Button>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setIsAddingList(true);
                setNewListTitle('');
              }}
              className="w-72 h-14 bg-muted/20 border-2 border-dashed border-muted rounded-lg items-center justify-center"
            >
              <Text className="text-muted-foreground font-medium">+ Add another list</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <LabelManagerModal
        visible={isLabelManagerOpen}
        labels={labels}
        onClose={() => setIsLabelManagerOpen(false)}
        onCreate={(payload) => {
          const tempId = `tmp-label-${Date.now()}`;
          patchLabels((current) => [
            ...current,
            {
              id: tempId,
              publicId: tempId,
              name: payload.name,
              color: payload.color,
              colourCode: payload.color,
              boardId: boardId ?? '',
            },
          ]);
          createLabelMutation.mutate(
            { name: payload.name, colourCode: payload.color },
            { onError: rollbackLabels },
          );
        }}
        onUpdate={(id, payload) => {
          patchLabels((current) =>
            current.map((l) =>
              (l.publicId ?? l.id) === id
                ? { ...l, name: payload.name, color: payload.color, colourCode: payload.color }
                : l,
            ),
          );
          patchBoard((currentLists) =>
            currentLists.map((l) => ({
              ...l,
              cards: (l.cards ?? []).map((c) => ({
                ...c,
                labels: (c.labels ?? []).map((cl) =>
                  (cl.publicId ?? cl.id) === id
                    ? { ...cl, name: payload.name, color: payload.color, colourCode: payload.color }
                    : cl,
                ),
              })),
            })),
          );
          updateLabelMutation.mutate(
            { labelId: id, payload: { name: payload.name, colourCode: payload.color } },
            {
              onError: () => {
                rollbackLabels();
                rollbackBoard();
              },
            },
          );
        }}
        onDelete={(id) => {
          patchLabels((current) => current.filter((l) => (l.publicId ?? l.id) !== id));
          patchBoard((currentLists) =>
            currentLists.map((l) => ({
              ...l,
              cards: (l.cards ?? []).map((c) => ({
                ...c,
                labels: (c.labels ?? []).filter((cl) => (cl.publicId ?? cl.id) !== id),
              })),
            })),
          );
          deleteLabelMutation.mutate(id, {
            onError: () => {
              rollbackLabels();
              rollbackBoard();
            },
          });
        }}
      />

      <LabelPickerSheet
        visible={activeCardRef?.type === 'labels'}
        onClose={() => setActiveCardRef(null)}
        boardLabels={labels}
        attachedLabelIds={activeCard ? cardLabelIds(activeCard) : []}
        onToggleLabel={(label, isAttached) => {
          if (!activeCardRef) return;
          const targetCardId = activeCardRef.cardId;
          const fullLabel = labelsData.find((l) => (l.publicId ?? l.id) === label.id);
          patchBoard((currentLists) =>
            currentLists.map((l) => ({
              ...l,
              cards: (l.cards ?? []).map((c) => {
                if (cardPublicId(c) !== targetCardId) return c;
                const existing = c.labels ?? [];
                if (isAttached) {
                  return {
                    ...c,
                    labels: existing.filter((cl) => (cl.publicId ?? cl.id) !== label.id),
                  };
                }
                if (existing.some((cl) => (cl.publicId ?? cl.id) === label.id)) return c;
                const newLabel: ApiLabel =
                  fullLabel ??
                  ({
                    id: label.id,
                    publicId: label.id,
                    name: label.name,
                    color: label.color,
                    colourCode: label.color,
                    boardId: boardId ?? '',
                  } as ApiLabel);
                return { ...c, labels: [...existing, newLabel] };
              }),
            })),
          );
          if (isAttached) {
            detachLabelMutation.mutate(
              { cardId: targetCardId, labelId: label.id },
              { onError: rollbackBoard },
            );
          } else {
            attachLabelMutation.mutate(
              { cardId: targetCardId, labelId: label.id },
              { onError: rollbackBoard },
            );
          }
        }}
        onOpenManager={() => setIsLabelManagerOpen(true)}
      />

      <MemberPickerSheet
        visible={activeCardRef?.type === 'members'}
        onClose={() => setActiveCardRef(null)}
        members={members}
        assignedMemberIds={activeCard ? cardMemberIds(activeCard) : []}
        onToggleMember={(memberId, isAssigned) => {
          if (!activeCardRef) return;
          const targetCardId = activeCardRef.cardId;
          patchBoard((currentLists) =>
            currentLists.map((l) => ({
              ...l,
              cards: (l.cards ?? []).map((c) => {
                if (cardPublicId(c) !== targetCardId) return c;
                const existing = c.members ?? [];
                if (isAssigned) {
                  return { ...c, members: existing.filter((id) => id !== memberId) };
                }
                if (existing.includes(memberId)) return c;
                return { ...c, members: [...existing, memberId] };
              }),
            })),
          );
          if (isAssigned) {
            unassignMemberMutation.mutate(
              { cardId: targetCardId, memberId },
              { onError: rollbackBoard },
            );
          } else {
            assignMemberMutation.mutate(
              { cardId: targetCardId, workspaceMemberPublicId: memberId },
              { onError: rollbackBoard },
            );
          }
        }}
      />

      <DueDatePickerSheet
        visible={activeCardRef?.type === 'dueDate'}
        onClose={() => setActiveCardRef(null)}
        dueDate={activeCard?.dueDate ?? null}
        onSetDueDate={(value) => {
          if (!activeCardRef) return;
          const targetCardId = activeCardRef.cardId;
          const nextDueDate = value === null ? null : new Date(value).toISOString();
          patchBoard((currentLists) =>
            currentLists.map((l) => ({
              ...l,
              cards: (l.cards ?? []).map((c) =>
                cardPublicId(c) === targetCardId ? { ...c, dueDate: nextDueDate } : c,
              ),
            })),
          );
          if (value === null) {
            clearDueDateMutation.mutate(targetCardId, { onError: rollbackBoard });
          } else {
            setDueDateMutation.mutate(
              { cardId: targetCardId, dueDate: nextDueDate as string },
              { onError: rollbackBoard },
            );
          }
        }}
      />

      <ConfirmDialog
        visible={deletingListId !== null}
        title="Delete list"
        message="This will remove the list and all its cards. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onClose={() => setDeletingListId(null)}
        onConfirm={() => {
          if (deletingListId) {
            const idToDelete = deletingListId;
            patchBoard((currentLists) =>
              currentLists.filter((l) => listPublicId(l) !== idToDelete),
            );
            deleteListMutation.mutate(idToDelete, { onError: rollbackBoard });
          }
          setDeletingListId(null);
        }}
      />
    </View>
  );
}
