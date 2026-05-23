import { api } from '~/lib/api';
import { NOTIFICATIONS } from '~/lib/api/routes';

export type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export async function listNotifications(): Promise<Notification[]> {
  const data = await api
    .get(NOTIFICATIONS.LIST)
    .json<Notification[] | { data: Notification[] }>();
  return Array.isArray(data) ? data : data?.data ?? [];
}
