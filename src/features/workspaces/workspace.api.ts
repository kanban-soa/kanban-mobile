import { api } from '~/lib/api';
import { WORKSPACES } from '~/lib/api/routes';
import type {
  ChangeRoleRequest,
  Invitation,
  InviteMemberRequest,
  MemberRequest,
  Workspace,
} from '~/lib/api/types';

function unwrap<T>(payload: T[] | { data: T[] } | null | undefined): T[] {
  if (Array.isArray(payload)) return payload;
  return payload?.data ?? [];
}

export async function listWorkspaces(): Promise<Workspace[]> {
  const data = await api
    .get(WORKSPACES.LIST)
    .json<Workspace[] | { data: Workspace[] }>();
  return unwrap(data);
}

export async function getWorkspace(id: string): Promise<Workspace> {
  return api.get(WORKSPACES.DETAIL(id)).json<Workspace>();
}

export async function createWorkspace(name: string): Promise<Workspace> {
  return api.post(WORKSPACES.CREATE, { json: { name } }).json<Workspace>();
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
  return api
    .post(WORKSPACES.INVITE(workspaceId), { json: payload })
    .json<Invitation>();
}

export async function changeRole(
  workspaceId: string,
  memberId: string,
  payload: ChangeRoleRequest,
): Promise<ChangeRoleRequest> {
  return api
    .patch(WORKSPACES.CHANGE_ROLE(workspaceId, memberId), { json: payload })
    .json<ChangeRoleRequest>();
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
