/**
 * Centralized API gateway route constants. Mirrors kanban-web/src/lib/api/routes.ts.
 * Base URL configured via EXPO_PUBLIC_API_URL (defaults to http://localhost:8080).
 */

export const AUTH = {
  LOGIN: 'api/v1/auth/login',
  REGISTER: 'api/v1/auth/register',
  LIST_ACCOUNTS: 'api/v1/auth/',
  UPDATE_USER: (id: string) => `api/v1/auth/users/${id}`,
  GET_USER: (id: string) => `api/v1/auth/users/${id}`,
} as const;

export const WORKSPACES = {
  LIST: 'api/v1/workspaces',
  CREATE: 'api/v1/workspaces',
  DETAIL: (id: string) => `api/v1/workspaces/${id}`,
  UPDATE: (id: string) => `api/v1/workspaces/${id}`,
  DELETE: (id: string) => `api/v1/workspaces/${id}`,
  MEMBERS: (workspaceId: string) => `api/v1/workspaces/${workspaceId}/members`,
  INVITE: (workspaceId: string) => `api/v1/workspaces/${workspaceId}/members`,
  CHANGE_ROLE: (workspaceId: string, memberId: string) =>
    `api/v1/workspaces/${workspaceId}/members/${memberId}`,
  REMOVE_MEMBER: (workspaceId: string, memberId: string) =>
    `api/v1/workspaces/${workspaceId}/members/${memberId}`,
  INVITATIONS: (workspaceId: string) =>
    `api/v1/workspaces/${workspaceId}/members/invitation`,
  REMOVE_INVITATION: (workspaceId: string, invitationId: string) =>
    `api/v1/workspaces/${workspaceId}/members/invitation/${invitationId}`,
} as const;

export const BOARDS = {
  LIST: 'api/v1/boards',
  CREATE: 'api/v1/boards',
} as const;

export const NOTIFICATIONS = {
  LIST: 'api/v1/notifications',
} as const;

export const STATISTICS = {
  GET: 'api/v1/statistics',
} as const;
