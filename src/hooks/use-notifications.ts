import { useQuery } from '@tanstack/react-query';

import { listNotifications } from '~/features/notifications/notification.api';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
  });
}
