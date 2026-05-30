import { api } from '~/lib/api';
import { INVITATIONS, WORKSPACES } from '~/lib/api/routes';
import type {
  ChangeRoleRequest,
  CreateWorkspaceRequest,
  Invitation,
  InviteMemberRequest,
  MemberRequest,
  UpdateWorkspaceRequest,
  Workspace,
} from '~/lib/api/types';

function unwrap<T>(payload: T[] | { data: T[] } | null | undefined): T[] {
  if (Array.isArray(payload)) return payload;
  return payload?.data ?? [];
}

function unwrapOne<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function listWorkspaces(): Promise<Workspace[]> {
  const data = await api
    .get(WORKSPACES.LIST)
    .json<Workspace[] | { data: Workspace[] }>();
  return unwrap(data);
}

export async function getDefaultWorkspace(): Promise<Workspace> {
  const data = await api
    .get(WORKSPACES.DEFAULT)
    .json<Workspace | { data: Workspace }>();
  return unwrapOne(data);
}

export async function getWorkspace(id: string): Promise<Workspace> {
  const data = await api
    .get(WORKSPACES.DETAIL(id))
    .json<Workspace | { data: Workspace }>();
  return unwrapOne(data);
}

export async function createWorkspace(
  payload: CreateWorkspaceRequest,
): Promise<Workspace> {
  const data = await api
    .post(WORKSPACES.CREATE, { json: payload })
    .json<Workspace | { data: Workspace }>();
  return unwrapOne(data);
}

export async function updateWorkspace(
  id: string,
  payload: UpdateWorkspaceRequest,
): Promise<Workspace> {
  const data = await api
    .patch(WORKSPACES.UPDATE(id), { json: payload })
    .json<Workspace | { data: Workspace }>();
  return unwrapOne(data);
}

export async function deleteWorkspace(id: string): Promise<void> {
  await api.delete(WORKSPACES.DELETE(id));
}

export async function getMembers(workspaceId: string): Promise<MemberRequest[]> {
  const data = await api
    .get(WORKSPACES.MEMBERS(workspaceId))
    .json<MemberRequest[] | { data: MemberRequest[] }>();
  return unwrap(data);
}

export async function inviteMember(
  workspaceId: string,
  payload: InviteMemberRequest,
): Promise<Invitation> {
  const data = await api
    .post(WORKSPACES.INVITE(workspaceId), { json: payload })
    .json<Invitation | { data: Invitation }>();
  return unwrapOne(data);
}

export async function changeRole(
  workspaceId: string,
  memberId: string,
  payload: ChangeRoleRequest,
): Promise<Invitation> {
  const data = await api
    .patch(WORKSPACES.CHANGE_ROLE(workspaceId, memberId), { json: payload })
    .json<Invitation | { data: Invitation }>();
  return unwrapOne(data);
}

export async function removeMember(
  workspaceId: string,
  memberId: string,
): Promise<void> {
  await api.delete(WORKSPACES.REMOVE_MEMBER(workspaceId, memberId));
}

export async function getInvitations(workspaceId: string): Promise<Invitation[]> {
  const data = await api
    .get(WORKSPACES.INVITATIONS(workspaceId))
    .json<Invitation[] | { data: Invitation[] }>();
  return unwrap(data);
}

export async function removeInvitation(
  workspaceId: string,
  invitationId: string,
): Promise<void> {
  await api.delete(WORKSPACES.REMOVE_INVITATION(workspaceId, invitationId));
}

export async function getMyInvitations(): Promise<Invitation[]> {
  const data = await api
    .get(WORKSPACES.MY_INVITATIONS)
    .json<Invitation[] | { data: Invitation[] }>();
  return unwrap(data);
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  await api.patch(INVITATIONS.ACCEPT(invitationId));
}

export async function rejectInvitation(invitationId: string): Promise<void> {
  await api.patch(INVITATIONS.REJECT(invitationId));
}
