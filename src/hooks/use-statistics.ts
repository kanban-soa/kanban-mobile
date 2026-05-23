import { useQuery } from '@tanstack/react-query';

import { getStatistics } from '~/features/statistics/statistics.api';

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: getStatistics,
  });
}
