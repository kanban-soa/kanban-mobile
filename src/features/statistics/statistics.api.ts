import { api } from '~/lib/api';
import { STATISTICS } from '~/lib/api/routes';
import type {
  ActivityQuery,
  PagedActivityResponse,
  StatisticsRange,
  StatisticsSelfPerformance,
  StatisticsSummary,
} from '~/lib/api/types';

const DEFAULT_BASE_URL = 'http://localhost:8080';

const statsBaseUrl =
  process.env.EXPO_PUBLIC_STATISTIC_SERVICE_URL?.replace(/\/$/, '') ??
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  DEFAULT_BASE_URL;

function unwrapOne<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function buildSearchParams(input: Record<string, string | number | undefined>) {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === '') continue;
    params[key] = String(value);
  }
  return params;
}

export async function getWorkspaceStatistics(
  workspaceId: number,
  range: StatisticsRange,
): Promise<StatisticsSummary> {
  const data = await api
    .get(STATISTICS.WORKSPACE(String(workspaceId)), {
      prefixUrl: statsBaseUrl,
      searchParams: { range },
    })
    .json<StatisticsSummary | { data: StatisticsSummary }>();
  return unwrapOne(data);
}

export async function getSelfPerformance(
  workspaceId: number,
  range: StatisticsRange,
): Promise<StatisticsSelfPerformance> {
  const data = await api
    .get(STATISTICS.SELF_PERFORMANCE(String(workspaceId)), {
      prefixUrl: statsBaseUrl,
      searchParams: { range },
    })
    .json<StatisticsSelfPerformance | { data: StatisticsSelfPerformance }>();
  return unwrapOne(data);
}

export async function getWorkspaceActivities(
  workspaceId: number,
  query: ActivityQuery,
): Promise<PagedActivityResponse> {
  const data = await api
    .get(STATISTICS.ACTIVITIES(String(workspaceId)), {
      prefixUrl: statsBaseUrl,
      searchParams: buildSearchParams(query),
    })
    .json<PagedActivityResponse | { data: PagedActivityResponse }>();
  return unwrapOne(data);
}

export async function exportWorkspaceStatistics(
  workspaceId: number,
  range: StatisticsRange,
  format: 'csv' | 'json',
): Promise<Blob> {
  const response = await api.get(STATISTICS.EXPORT(String(workspaceId)), {
    prefixUrl: statsBaseUrl,
    searchParams: { range, format },
  });
  return response.blob();
}

export async function getBoardMetrics<T = unknown>(): Promise<T> {
  return api.get(STATISTICS.BOARD_METRICS).json<T>();
}

export async function getBoardActivities<T = unknown>(): Promise<T> {
  return api.get(STATISTICS.BOARD_ACTIVITIES).json<T>();
}

export async function getBoardPriorities<T = unknown>(): Promise<T> {
  return api.get(STATISTICS.BOARD_PRIORITIES).json<T>();
}

export async function getBoardWorkloads<T = unknown>(): Promise<T> {
  return api.get(STATISTICS.BOARD_WORKLOADS).json<T>();
}
