import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { WorkspaceBanner } from '~/components/workspace-banner';
import {
  useWorkspaceActivities,
  useWorkspaceStatistics,
} from '~/hooks/use-statistics';
import { useActiveWorkspaceStore } from '~/store/active-workspace.store';
import { useSurfaceColors } from '~/lib/surface-colors';
import type { StatisticsRange } from '~/lib/api/types';

const RANGE_LABEL: Record<StatisticsRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

type Metric = {
  title: string;
  value: number;
  trend: number;
  icon: React.ComponentProps<typeof Feather>['name'];
};

function formatTrend(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

function formatActivityTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function activityVerb(actionType: string) {
  const [, action] = actionType.split('.');
  return action ?? actionType;
}

export default function StatisticOverviewScreen() {
  const router = useRouter();
  const colors = useSurfaceColors();
  const [range, setRange] = useState<StatisticsRange>('30d');
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const activeWorkspace = useActiveWorkspaceStore((s) => s.activeWorkspace);
  const workspaceId = activeWorkspace?.id;

  const { data: summary, isLoading: summaryLoading } = useWorkspaceStatistics(
    workspaceId,
    range,
  );
  const { data: activitiesPage, isLoading: activitiesLoading } =
    useWorkspaceActivities(workspaceId, { page: 1, limit: 4 });

  const metrics: Metric[] = useMemo(() => {
    if (!summary) return [];
    return [
      {
        title: 'Created',
        value: summary.metrics.created,
        trend: summary.metrics.createdTrend,
        icon: 'plus-circle',
      },
      {
        title: 'Updated',
        value: summary.metrics.updated,
        trend: summary.metrics.updatedTrend,
        icon: 'clock',
      },
      {
        title: 'Due Soon',
        value: summary.metrics.dueSoon,
        trend: summary.metrics.dueSoonTrend,
        icon: 'bell',
      },
    ];
  }, [summary]);

  const priorities = summary?.priorities ?? [];
  const workloads = summary?.workloads ?? [];

  const totalPriorityValue = useMemo(
    () => priorities.reduce((sum, p) => sum + p.value, 0),
    [priorities],
  );

  const recentActivities = activitiesPage?.items ?? [];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4">
      <WorkspaceBanner />

      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-foreground">Statistics</Text>
        <Pressable
          onPress={() => setRangePickerOpen(true)}
          className="flex-row items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5">
          <Text className="text-sm text-foreground">{RANGE_LABEL[range]}</Text>
          <Feather name="chevron-down" size={14} className="text-muted-foreground" />
        </Pressable>
      </View>

      <View className="mb-6 flex-row items-center gap-2 rounded-md border border-border bg-muted/30 p-1">
        <View className="flex-1 rounded bg-card py-1.5">
          <Text className="text-center text-sm font-semibold text-foreground">Team</Text>
        </View>
        <Link href="/(app)/statistic/self" asChild>
          <Pressable className="flex-1 py-1.5">
            <Text className="text-center text-sm text-muted-foreground">Self</Text>
          </Pressable>
        </Link>
      </View>

      {!workspaceId ? (
        <Card className="mb-6 p-6 items-center">
          <Text className="text-sm text-muted-foreground">
            Select a workspace to view statistics.
          </Text>
        </Card>
      ) : summaryLoading ? (
        <View className="mb-6 items-center justify-center py-8">
          <ActivityIndicator />
        </View>
      ) : !summary ? (
        <Card className="mb-6 p-6 items-center">
          <Text className="text-sm text-muted-foreground">
            No statistics available yet.
          </Text>
        </Card>
      ) : (
        <>
          <View className="mb-6 flex-row flex-wrap gap-3">
            {metrics.map((m) => (
              <Card key={m.title} className="min-w-[45%] flex-1 p-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <View className="rounded-md bg-muted p-2">
                    <Feather name={m.icon} size={14} className="text-primary" />
                  </View>
                  <Text
                    className={`text-xs font-semibold ${m.trend >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                    {formatTrend(m.trend)}
                  </Text>
                </View>
                <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {m.title}
                </Text>
                <Text className="mt-1 text-2xl font-black text-foreground">{m.value}</Text>
              </Card>
            ))}
          </View>

          <Card className="mb-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Recent Activity</Text>
              <Pressable onPress={() => router.push('/(app)/statistic/activities')}>
                <Text className="text-xs font-semibold uppercase tracking-wider text-primary">
                  View all
                </Text>
              </Pressable>
            </View>
            {activitiesLoading ? (
              <ActivityIndicator />
            ) : recentActivities.length === 0 ? (
              <Text className="text-sm text-muted-foreground">No activity yet.</Text>
            ) : (
              <View className="gap-4">
                {recentActivities.map((a) => {
                  const verb = activityVerb(a.actionType);
                  const target = a.metadata.title ?? a.metadata.name ?? a.entityId;
                  const actor = (a.metadata.actor as { name?: string })?.name ?? 'Someone';
                  return (
                    <View key={a.publicId} className="flex-row items-center gap-3">
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <Text className="text-xs font-bold text-foreground">
                          {actor
                            .split(' ')
                            .map((s) => s[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm text-foreground" numberOfLines={2}>
                          <Text className="font-semibold text-primary">{actor}</Text>{' '}
                          <Text className="italic text-muted-foreground">{verb}</Text>{' '}
                          <Text className="text-muted-foreground">{a.entityType}</Text>{' '}
                          <Text className="font-medium">{target}</Text>
                        </Text>
                        <Text className="mt-0.5 text-xs text-muted-foreground">
                          {formatActivityTime(a.createdAt)}
                        </Text>
                      </View>
                      <Badge variant="outline">
                        <Text className="text-[10px] uppercase">{verb}</Text>
                      </Badge>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          <Card className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-foreground">Priority Breakdown</Text>
            {priorities.length === 0 ? (
              <Text className="text-sm text-muted-foreground">No priority data.</Text>
            ) : (
              <View className="gap-3">
                {priorities.map((p) => {
                  const pct = totalPriorityValue ? (p.value / totalPriorityValue) * 100 : 0;
                  return (
                    <View key={p.label}>
                      <View className="mb-1.5 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <View
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <Text className="text-sm font-medium text-foreground">{p.label}</Text>
                        </View>
                        <Text className="text-sm font-bold text-foreground">{formatPercent(pct)}</Text>
                      </View>
                      <View className="h-2 overflow-hidden rounded-full bg-muted">
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: p.color }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          <Card className="mb-6">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Team Workload</Text>
            </View>
            <Text className="mb-4 text-xs text-muted-foreground">
              Real-time capacity tracking for active sprints
            </Text>
            {workloads.length === 0 ? (
              <Text className="text-sm text-muted-foreground">No workload data.</Text>
            ) : (
              <View className="gap-3">
                {workloads.map((w) => {
                  const cap = clamp(w.capacity);
                  return (
                    <View
                      key={w.name}
                      className="rounded-md border border-border/70 bg-muted/20 p-3">
                      <View className="mb-2 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <View className="h-2 w-2 rounded-full bg-primary" />
                          <Text className="text-sm font-semibold text-foreground">{w.name}</Text>
                        </View>
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {w.state}
                        </Text>
                      </View>
                      <View className="h-2 overflow-hidden rounded-full bg-muted">
                        <View className="h-full bg-primary" style={{ width: `${cap}%` }} />
                      </View>
                      <Text className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {formatPercent(cap)} capacity
                      </Text>
                    </View>
                  );
                })}
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

      <View className="mb-6">
        <Button
          variant="outline"
          onPress={() => router.push('/(app)/statistic/activities')}>
          <Text className="text-sm font-medium text-foreground">View full activity log</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
