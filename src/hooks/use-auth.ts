import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import {
  getUser,
  listAccounts,
  login,
  logout,
  register,
  updateUser,
} from '~/features/auth/auth.api';
import type { Account } from '~/lib/api/types';

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: login,
    onSuccess: () => router.replace('/workspaces/default/boards'),
    onError: (error) => console.error('Login failed', error),
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: register,
    onSuccess: () => router.replace('/workspaces/default/boards'),
  });
}

export function useLogout() {
  return useMutation({ mutationFn: logout });
}

export function useListAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: listAccounts,
  });
}

export function useGetUser(id: string | undefined) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => (id ? getUser(id) : null),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Account> }) =>
      updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
