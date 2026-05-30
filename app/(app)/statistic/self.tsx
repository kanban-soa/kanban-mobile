import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Card } from '~/components/ui/card';
import { WorkspaceBanner } from '~/components/workspace-banner';
import { useSelfPerformance } from '~/hooks/use-statistics';
import { useActiveWorkspaceStore } from '~/store/active-workspace.store';
import { useSurfaceColors } from '~/lib/surface-colors';
import type { StatisticsRange } from '~/lib/api/types';

const RANGE_LABEL: Record<StatisticsRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatTrend(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export default function SelfPerformanceScreen() {
  const colors = useSurfaceColors();
  const [range, setRange] = useState<StatisticsRange>('7d');
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const activeWorkspace = useActiveWorkspaceStore((s) => s.activeWorkspace);
  const workspaceId = activeWorkspace?.id;

  const { data: performance, isLoading } = useSelfPerformance(workspaceId, range);

  const completed = clamp(performance?.completedPercentage ?? 0);
  const overdueTasks = performance?.overdueTasks ?? [];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4">
      <WorkspaceBanner />

      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-3xl font-bold text-foreground">Self</Text>
          <Text className="text-xs text-muted-foreground">Your performance this period.</Text>
        </View>
        <Pressable
          onPress={() => setRangePickerOpen(true)}
          className="flex-row items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5">
          <Text className="text-sm text-foreground">{RANGE_LABEL[range]}</Text>
          <Feather name="chevron-down" size={14} className="text-muted-foreground" />
        </Pressable>
      </View>

      <View className="mb-6 flex-row items-center gap-2 rounded-md border border-border bg-muted/30 p-1">
        <Link href="/(app)/statistic" asChild>
          <Pressable className="flex-1 py-1.5">
            <Text className="text-center text-sm text-muted-foreground">Team</Text>
          </Pressable>
        </Link>
        <View className="flex-1 rounded bg-card py-1.5">
          <Text className="text-center text-sm font-semibold text-foreground">Self</Text>
        </View>
      </View>

      {!workspaceId ? (
        <Card className="p-6 items-center">
          <Text className="text-sm text-muted-foreground">
            Select a workspace to view your performance.
          </Text>
        </Card>
      ) : isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator />
        </View>
      ) : !performance ? (
        <Card className="p-6 items-center">
          <Text className="text-sm text-muted-foreground">No performance data yet.</Text>
        </Card>
      ) : (
        <>
          <View className="mb-6 flex-row flex-wrap gap-3">
            <Card className="min-w-[45%] flex-1 p-4">
              <View className="mb-3 rounded-md bg-emerald-500/10 p-2 self-start">
                <Feather name="check-circle" size={14} color="#10b981" />
              </View>
              <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Completed
              </Text>
              <Text className="mt-1 text-2xl font-black text-foreground">
                {performance.completedTotal}
              </Text>
            </Card>
            <Card className="min-w-[45%] flex-1 p-4">
              <View className="mb-3 rounded-md bg-destructive/10 p-2 self-start">
                <Feather name="alert-triangle" size={14} className="text-destructive" />
              </View>
              <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Overdue
              </Text>
              <Text className="mt-1 text-2xl font-black text-foreground">
                {performance.overdueTotal}
              </Text>
            </Card>
            <Card className="min-w-[45%] flex-1 p-4">
              <View className="mb-3 rounded-md bg-primary/10 p-2 self-start">
                <Feather name="trending-up" size={14} className="text-primary" />
              </View>
              <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Vs team avg
              </Text>
              <Text className="mt-1 text-2xl font-black text-foreground">
                {formatTrend(performance.comparisonPercentage)}
              </Text>
            </Card>
          </View>

          <Card className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-foreground">Completion rate</Text>
            <View className="items-center">
              <View className="mb-2 flex-row items-end gap-1">
                <Text className="text-4xl font-black text-foreground">{formatPercent(completed)}</Text>
              </View>
              <Text className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                Completed
              </Text>
              <View className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${completed}%` }}
                />
              </View>
              <Text className="mt-3 text-center text-xs text-muted-foreground">
                Completed vs total tasks in the selected range.
              </Text>
            </View>
          </Card>

          <Card className="mb-6">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Overdue alerts</Text>
              <View className="rounded-full bg-destructive/10 px-3 py-1">
                <Text className="text-xs font-semibold text-destructive">
                  {performance.overdueTotal} overdue
                </Text>
              </View>
            </View>
            <Text className="mb-4 text-xs text-muted-foreground">
              Tasks that missed their deadlines
            </Text>
            {overdueTasks.length === 0 ? (
              <View className="rounded-md border border-dashed border-border p-4">
                <Text className="text-sm text-muted-foreground">
                  No overdue tasks in this range.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {overdueTasks.map((task) => (
                  <View
                    key={task.id}
                    className="flex-row items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 p-3">
                    <View className="flex-1 pr-3">
                      <Text className="text-sm font-semibold text-foreground">{task.title}</Text>
                      <Text className="mt-0.5 text-xs text-destructive">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="rounded-full bg-destructive/20 px-2.5 py-1">
                      <Text className="text-[10px] font-bold uppercase tracking-widest text-destructive">
                        Overdue
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </>
      )}

      <Modal
        visible={rangePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRangePickerOpen(false)}>
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setRangePickerOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="rounded-t-2xl p-4 pb-8"
              style={{
                backgroundColor: colors.background,
                borderTopWidth: 1,
                borderColor: colors.border,
              }}>
              <View
                className="mb-3 self-center h-1 w-10 rounded-full"
                style={{ backgroundColor: colors.border }}
              />
              <Text className="mb-3 text-base font-semibold text-foreground">Date range</Text>
              {(['7d', '30d', '90d'] as StatisticsRange[]).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => {
                    setRange(r);
                    setRangePickerOpen(false);
                  }}
                  className="flex-row items-center justify-between py-3">
                  <Text className="text-base text-foreground">{RANGE_LABEL[r]}</Text>
                  {range === r && (
                    <Feather name="check" size={16} className="text-foreground" />
                  )}
                </Pressable>
              ))}
              <Pressable
                onPress={() => setRangePickerOpen(false)}
                className="mt-2 items-center p-3">
                <Text className="font-medium text-muted-foreground">Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
