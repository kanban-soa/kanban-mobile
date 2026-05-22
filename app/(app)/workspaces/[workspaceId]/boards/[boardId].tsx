import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Mock data for board columns and tasks
const INITIAL_COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: '1', title: 'Design landing page', priority: 'High' },
      { id: '2', title: 'Set up database', priority: 'Medium' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      { id: '3', title: 'Implement authentication', priority: 'High' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: '4', title: 'Project scaffolding', priority: 'Low' },
    ],
  },
];

type Task = { id: string; title: string; priority: string };

function DraggableCard({
  task,
  sourceColumnId,
  onDrop,
  onDelete,
}: {
  task: Task;
  sourceColumnId: string;
  onDrop: (taskId: string, sourceColId: string, x: number, y: number) => void;
  onDelete: (taskId: string, sourceColId: string) => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const zIndex = useSharedValue(1);

  const handleDragEnd = (taskId: string, sourceColId: string, absX: number, absY: number) => {
    onDrop(taskId, sourceColId, absX, absY);
  };

  const pan = Gesture.Pan()
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

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>
        <Card className="mb-3 p-3 bg-card border-border">
          <View className="flex-row items-start justify-between">
            <Text className="text-base font-medium text-foreground mb-2 flex-1 pr-2">{task.title}</Text>
            <Pressable onPress={() => onDelete(task.id, sourceColumnId)} className="p-1">
              <Feather name="x" size={16} className="text-muted-foreground" />
            </Pressable>
          </View>
          <View className="self-start bg-primary/10 px-2 py-1 rounded-md mt-1">
            <Text className="text-xs text-primary">{task.priority}</Text>
          </View>
        </Card>
      </Animated.View>
    </GestureDetector>
  );
}

export default function BoardScreen() {
  const { workspaceId, boardId } = useLocalSearchParams();
  const router = useRouter();
  const defaultBoardName = boardId === 'default-board' ? 'Default Board' : `Board ${boardId}`;

  const [boardName, setBoardName] = useState(defaultBoardName);
  const [isEditingBoardName, setIsEditingBoardName] = useState(false);

  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [scrollX, setScrollX] = useState(0);

  // States for adding inline
  const [addingCardTo, setAddingCardTo] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const handleDrop = (taskId: string, sourceColumnId: string, absoluteX: number, absoluteY: number) => {
    const targetX = absoluteX - 16 + scrollX;
    const colIndex = Math.floor(targetX / 304);

    if (colIndex >= 0 && colIndex < columns.length) {
      const targetColumnId = columns[colIndex].id;

      if (targetColumnId !== sourceColumnId) {
        setColumns((prev) => {
          const newColumns = prev.map((col) => ({ ...col, tasks: [...col.tasks] }));
          const sourceColIndex = newColumns.findIndex((c) => c.id === sourceColumnId);
          const targetColIndex = newColumns.findIndex((c) => c.id === targetColumnId);

          const taskIndex = newColumns[sourceColIndex].tasks.findIndex((t) => t.id === taskId);
          const [taskToMove] = newColumns[sourceColIndex].tasks.splice(taskIndex, 1);

          newColumns[targetColIndex].tasks.push(taskToMove);
          return newColumns;
        });
      }
    }
  };

  const handleDeleteCard = (taskId: string, columnId: string) => {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          };
        }
        return col;
      })
    );
  };

  const handleDeleteList = (columnId: string) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
  };

  const handleAddCardSubmit = (colId: string) => {
    if (!newCardTitle.trim()) {
      setAddingCardTo(null);
      return;
    }
    setColumns((prev) =>
      prev.map((c) => {
        if (c.id === colId) {
          return {
            ...c,
            tasks: [
              ...c.tasks,
              { id: Date.now().toString(), title: newCardTitle.trim(), priority: 'Low' },
            ],
          };
        }
        return c;
      })
    );
    setNewCardTitle('');
    setAddingCardTo(null);
  };

  const handleAddListSubmit = () => {
    if (!newListTitle.trim()) {
      setIsAddingList(false);
      return;
    }
    setColumns((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newListTitle.trim(), tasks: [] },
    ]);
    setNewListTitle('');
    setIsAddingList(false);
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Pressable onPress={() => router.back()} className="flex-row items-center mb-4">
        <Feather name="arrow-left" size={20} className="text-muted-foreground mr-2" />
        <Text className="text-base text-muted-foreground font-medium">Back to Boards</Text>
      </Pressable>

      {isEditingBoardName ? (
        <Input
          className="text-2xl font-bold h-12 mb-1 px-0 border-transparent focus:border-transparent bg-transparent"
          value={boardName}
          onChangeText={setBoardName}
          autoFocus
          onBlur={() => setIsEditingBoardName(false)}
          onSubmitEditing={() => setIsEditingBoardName(false)}
        />
      ) : (
        <Pressable onPress={() => setIsEditingBoardName(true)}>
          <Text className="text-2xl font-bold text-foreground mb-1">{boardName}</Text>
        </Pressable>
      )}
      <Text className="text-sm text-muted-foreground mb-6">Workspace: {workspaceId}</Text>

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
                  <Pressable onPress={() => handleDeleteList(column.id)} className="p-1">
                    <Feather name="trash-2" size={16} className="text-muted-foreground hover:text-destructive" />
                  </Pressable>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'visible' }}>
                {column.tasks.map((task) => (
                  <DraggableCard
                    key={task.id}
                    task={task}
                    sourceColumnId={column.id}
                    onDrop={handleDrop}
                    onDelete={handleDeleteCard}
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
    </View>
  );
}
