import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  changeRole,
  createWorkspace,
  getInvitations,
  getMembers,
  getWorkspace,
  inviteMember,
  listWorkspaces,
  removeInvitation,
  removeMember,
} from '~/features/workspaces/workspace.api';
import type { ChangeRoleRequest, InviteMemberRequest } from '~/lib/api/types';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspaces,
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ['workspaces', id],
    queryFn: () => getWorkspace(id),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () => getMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteMemberRequest) => inviteMember(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'invitations'] });
    },
  });
}

export function useChangeRole(workspaceId: string, memberId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeRoleRequest) => changeRole(workspaceId, memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
    },
  });
}

export function useInvitations(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'invitations'],
    queryFn: () => getInvitations(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useRemoveInvitation(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => removeInvitation(workspaceId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'invitations'] });
    },
  });
}
