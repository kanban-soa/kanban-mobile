import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { LabelManagerModal } from '~/components/board/label-manager-modal';
import {
  DueDatePickerSheet,
  LabelPickerSheet,
  MemberPickerSheet,
} from '~/components/board/card-quick-actions';
import { ConfirmDialog } from '~/components/confirm-dialog';
import {
  type BoardLabel,
  type Task,
  type WorkspaceMember,
  useBoardStore,
} from '~/store/board.store';

function formatDueDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DraggableCard({
  task,
  sourceColumnId,
  labels,
  members,
  onDrop,
  onOpenLabels,
  onOpenMembers,
  onOpenDueDate,
  onOpenCard,
}: {
  task: Task;
  sourceColumnId: string;
  labels: BoardLabel[];
  members: WorkspaceMember[];
  onDrop: (taskId: string, sourceColId: string, x: number, y: number) => void;
  onOpenLabels: (taskId: string, sourceColId: string) => void;
  onOpenMembers: (taskId: string, sourceColId: string) => void;
  onOpenDueDate: (taskId: string, sourceColId: string) => void;
  onOpenCard: (taskId: string) => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const zIndex = useSharedValue(1);

  const handleDragEnd = (taskId: string, sourceColId: string, absX: number, absY: number) => {
    onDrop(taskId, sourceColId, absX, absY);
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
      runOnJS(handleDragEnd)(task.id, sourceColumnId, event.absoluteX, event.absoluteY);
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

  const attachedLabels = labels.filter((l) => task.labelIds.includes(l.id));
  const assignedMembers = members.filter((m) => task.memberIds.includes(m.id));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>
        <Card className="mb-3 p-3 bg-card border-border">
          <Pressable onPress={() => onOpenCard(task.id)}>
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

            <Text className="text-base font-medium text-foreground mb-2">{task.title}</Text>

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
              {task.dueDate && (
                <View className="flex-row items-center">
                  <Feather name="calendar" size={12} className="text-muted-foreground" />
                  <Text className="text-[11px] text-muted-foreground ml-1">
                    {formatDueDate(task.dueDate)}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

          <View className="flex-row items-center mt-2 pt-2 border-t border-border gap-2">
            <Pressable
              onPress={() => onOpenLabels(task.id, sourceColumnId)}
              className="flex-row items-center px-2 py-1 rounded-md active:bg-muted"
              accessibilityLabel="Edit labels"
            >
              <Feather name="tag" size={12} className="text-muted-foreground" />
              <Text className="text-[11px] text-muted-foreground ml-1">Labels</Text>
            </Pressable>
            <Pressable
              onPress={() => onOpenMembers(task.id, sourceColumnId)}
              className="flex-row items-center px-2 py-1 rounded-md active:bg-muted"
              accessibilityLabel="Edit assignees"
            >
              <Feather name="user-plus" size={12} className="text-muted-foreground" />
              <Text className="text-[11px] text-muted-foreground ml-1">Assign</Text>
            </Pressable>
            <Pressable
              onPress={() => onOpenDueDate(task.id, sourceColumnId)}
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
  const { workspaceId, boardId } = useLocalSearchParams<{ workspaceId: string; boardId: string }>();
  const router = useRouter();
  const defaultBoardName = boardId === 'default-board' ? 'Default Board' : `Board ${boardId}`;

  const ensureBoard = useBoardStore((s) => s.ensureBoard);
  const board = useBoardStore((s) => s.boards[boardId]);
  const members = useBoardStore((s) => s.members);

  useEffect(() => {
    ensureBoard(boardId, defaultBoardName);
  }, [boardId, defaultBoardName, ensureBoard]);

  const updateBoardMeta = useBoardStore((s) => s.updateBoardMeta);
  const addColumn = useBoardStore((s) => s.addColumn);
  const deleteColumn = useBoardStore((s) => s.deleteColumn);
  const addCard = useBoardStore((s) => s.addCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const moveCard = useBoardStore((s) => s.moveCard);
  const addLabel = useBoardStore((s) => s.addLabel);
  const updateLabel = useBoardStore((s) => s.updateLabel);
  const deleteLabel = useBoardStore((s) => s.deleteLabel);
  const toggleCardLabel = useBoardStore((s) => s.toggleCardLabel);
  const toggleCardMember = useBoardStore((s) => s.toggleCardMember);
  const setCardDueDate = useBoardStore((s) => s.setCardDueDate);

  const columns = board?.columns ?? [];
  const labels = board?.labels ?? [];

  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    if (board) setEditingTitle(board.title);
  }, [board?.title]);

  const [scrollX, setScrollX] = useState(0);

  const [addingCardTo, setAddingCardTo] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState<string | null>(null);
  const [activeCardRef, setActiveCardRef] = useState<
    | { taskId: string; columnId: string; type: 'labels' | 'members' | 'dueDate' }
    | null
  >(null);

  const activeTask = useMemo(() => {
    if (!activeCardRef) return null;
    const col = columns.find((c) => c.id === activeCardRef.columnId);
    return col?.tasks.find((t) => t.id === activeCardRef.taskId) ?? null;
  }, [activeCardRef, columns]);

  const handleDrop = (taskId: string, sourceColumnId: string, absoluteX: number) => {
    const targetX = absoluteX - 16 + scrollX;
    const colIndex = Math.floor(targetX / 304);

    if (colIndex >= 0 && colIndex < columns.length) {
      const targetColumnId = columns[colIndex].id;
      if (targetColumnId !== sourceColumnId) {
        moveCard(boardId, taskId, targetColumnId);
      }
    }
  };

  const handleAddCardSubmit = (colId: string) => {
    if (!newCardTitle.trim()) {
      setAddingCardTo(null);
      return;
    }
    addCard(boardId, colId, newCardTitle.trim());
    setNewCardTitle('');
    setAddingCardTo(null);
  };

  const handleAddListSubmit = () => {
    if (!newListTitle.trim()) {
      setIsAddingList(false);
      return;
    }
    addColumn(boardId, newListTitle.trim());
    setNewListTitle('');
    setIsAddingList(false);
  };

  const commitTitleEdit = () => {
    const trimmed = editingTitle.trim();
    if (trimmed && trimmed !== board?.title) {
      updateBoardMeta(boardId, { title: trimmed });
    } else if (board) {
      setEditingTitle(board.title);
    }
    setIsEditingBoardName(false);
  };

  const onOpenCard = (taskId: string) => {
    router.push(`/workspaces/${workspaceId}/boards/${boardId}/cards/${taskId}`);
  };

  if (!board) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Loading board…</Text>
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
              <Text className="text-2xl font-bold text-foreground mb-1">{board.title}</Text>
            </Pressable>
          )}
          <Text className="text-sm text-muted-foreground">Workspace: {workspaceId}</Text>
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
          {columns.map((column) => (
            <View key={column.id} className="w-72 bg-muted/30 rounded-lg p-3 h-auto max-h-full">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-foreground">{column.title}</Text>
                <View className="flex-row items-center">
                  <View className="bg-muted px-2 py-0.5 rounded-full mr-2">
                    <Text className="text-xs font-medium text-muted-foreground">{column.tasks.length}</Text>
                  </View>
                  <Pressable
                    onPress={() => setDeletingColumnId(column.id)}
                    className="p-1"
                    accessibilityLabel={`Delete list ${column.title}`}
                  >
                    <Feather name="trash-2" size={16} className="text-muted-foreground" />
                  </Pressable>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'visible' }}>
                {column.tasks.map((task) => (
                  <DraggableCard
                    key={task.id}
                    task={task}
                    sourceColumnId={column.id}
                    labels={labels}
                    members={members}
                    onDrop={handleDrop}
                    onOpenLabels={(tid, cid) => setActiveCardRef({ taskId: tid, columnId: cid, type: 'labels' })}
                    onOpenMembers={(tid, cid) => setActiveCardRef({ taskId: tid, columnId: cid, type: 'members' })}
                    onOpenDueDate={(tid, cid) => setActiveCardRef({ taskId: tid, columnId: cid, type: 'dueDate' })}
                    onOpenCard={onOpenCard}
                  />
                ))}

                {addingCardTo === column.id ? (
                  <View className="mt-1">
                    <Input
                      autoFocus
                      placeholder="What needs to be done?"
                      value={newCardTitle}
                      onChangeText={setNewCardTitle}
                      onSubmitEditing={() => handleAddCardSubmit(column.id)}
                      onBlur={() => handleAddCardSubmit(column.id)}
                      className="bg-card border-border"
                    />
                  </View>
                ) : (
                  <Button
                    variant="ghost"
                    className="mt-1 justify-start px-2 h-10"
                    onPress={() => {
                      setAddingCardTo(column.id);
                      setNewCardTitle('');
                    }}
                  >
                    <Text className="text-muted-foreground">+ Add a card</Text>
                  </Button>
                )}
              </ScrollView>
            </View>
          ))}

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
                  <Text className="text-white">Add List</Text>
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
        onCreate={(payload) => addLabel(boardId, payload)}
        onUpdate={(id, payload) => updateLabel(boardId, id, payload)}
        onDelete={(id) => deleteLabel(boardId, id)}
      />

      <LabelPickerSheet
        visible={activeCardRef?.type === 'labels'}
        onClose={() => setActiveCardRef(null)}
        boardLabels={labels}
        attachedLabelIds={activeTask?.labelIds ?? []}
        onToggleLabel={(label) => {
          if (activeCardRef) toggleCardLabel(boardId, activeCardRef.taskId, label.id);
        }}
        onOpenManager={() => setIsLabelManagerOpen(true)}
      />

      <MemberPickerSheet
        visible={activeCardRef?.type === 'members'}
        onClose={() => setActiveCardRef(null)}
        members={members}
        assignedMemberIds={activeTask?.memberIds ?? []}
        onToggleMember={(memberId) => {
          if (activeCardRef) toggleCardMember(boardId, activeCardRef.taskId, memberId);
        }}
      />

      <DueDatePickerSheet
        visible={activeCardRef?.type === 'dueDate'}
        onClose={() => setActiveCardRef(null)}
        dueDate={activeTask?.dueDate ?? null}
        onSetDueDate={(value) => {
          if (activeCardRef) setCardDueDate(boardId, activeCardRef.taskId, value);
        }}
      />

      <ConfirmDialog
        visible={deletingColumnId !== null}
        title="Delete list"
        message="This will remove the list and all its cards. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onClose={() => setDeletingColumnId(null)}
        onConfirm={() => {
          if (deletingColumnId) deleteColumn(boardId, deletingColumnId);
          setDeletingColumnId(null);
        }}
      />
    </View>
  );
}
