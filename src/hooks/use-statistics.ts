import { useQuery } from '@tanstack/react-query';

import {
  getBoardActivities,
  getBoardMetrics,
  getBoardPriorities,
  getBoardWorkloads,
  getSelfPerformance,
  getWorkspaceActivities,
  getWorkspaceStatistics,
} from '~/features/statistics/statistics.api';
import type { ActivityQuery, StatisticsRange } from '~/lib/api/types';

export function useWorkspaceStatistics(
  workspaceId: string | undefined,
  range: StatisticsRange,
) {
  return useQuery({
    queryKey: ['statistics', workspaceId, 'summary', range],
    queryFn: () => getWorkspaceStatistics(workspaceId as string, range),
    enabled: !!workspaceId,
  });
}

export function useSelfPerformance(
  workspaceId: string | undefined,
  range: StatisticsRange,
) {
  return useQuery({
    queryKey: ['statistics', workspaceId, 'self', range],
    queryFn: () => getSelfPerformance(workspaceId as string, range),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceActivities(
  workspaceId: string | undefined,
  query: ActivityQuery,
) {
  return useQuery({
    queryKey: ['statistics', workspaceId, 'activities', query],
    queryFn: () => getWorkspaceActivities(workspaceId as string, query),
    enabled: !!workspaceId,
  });
}

export function useBoardMetrics() {
  return useQuery({
    queryKey: ['statistics', 'board', 'metrics'],
    queryFn: () => getBoardMetrics(),
  });
}

export function useBoardActivities() {
  return useQuery({
    queryKey: ['statistics', 'board', 'activities'],
    queryFn: () => getBoardActivities(),
  });
}

export function useBoardPriorities() {
  return useQuery({
    queryKey: ['statistics', 'board', 'priorities'],
    queryFn: () => getBoardPriorities(),
  });
}

export function useBoardWorkloads() {
  return useQuery({
    queryKey: ['statistics', 'board', 'workloads'],
    queryFn: () => getBoardWorkloads(),
  });
}
