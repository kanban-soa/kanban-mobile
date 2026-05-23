import { api } from '~/lib/api';
import { STATISTICS } from '~/lib/api/routes';

export type Statistics = Record<string, unknown>;

export async function getStatistics(): Promise<Statistics> {
  return api.get(STATISTICS.GET).json<Statistics>();
}
