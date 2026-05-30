import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptInvitation,
  changeRole,
  createWorkspace,
  deleteWorkspace,
  getDefaultWorkspace,
  getInvitations,
  getMembers,
  getMyInvitations,
  getWorkspace,
  inviteMember,
  listWorkspaces,
  rejectInvitation,
  removeInvitation,
  removeMember,
  updateWorkspace,
} from '~/features/workspaces/workspace.api';
import type {
  ChangeRoleRequest,
  CreateWorkspaceRequest,
  InviteMemberRequest,
  UpdateWorkspaceRequest,
} from '~/lib/api/types';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspaces,
  });
}

export function useDefaultWorkspace() {
  return useQuery({
    queryKey: ['workspaces', 'default'],
    queryFn: getDefaultWorkspace,
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
    mutationFn: (payload: CreateWorkspaceRequest) => createWorkspace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkspaceRequest) =>
      updateWorkspace(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => deleteWorkspace(workspaceId),
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
    mutationFn: (payload: InviteMemberRequest) =>
      inviteMember(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'members'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'invitations'],
      });
    },
  });
}

export function useChangeRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      payload,
    }: {
      memberId: string;
      payload: ChangeRoleRequest;
    }) => changeRole(workspaceId, memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'members'],
      });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'members'],
      });
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
    mutationFn: (invitationId: string) =>
      removeInvitation(workspaceId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'invitations'],
      });
    },
  });
}

export function useMyInvitations() {
  return useQuery({
    queryKey: ['invitations', 'me'],
    queryFn: getMyInvitations,
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => rejectInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', 'me'] });
    },
  });
}
