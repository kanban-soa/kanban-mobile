/**
 * Centralized API gateway route constants. Mirrors kanban-web/src/lib/api/routes.ts.
 * Base URL configured via EXPO_PUBLIC_API_URL (defaults to http://localhost:8080).
 */

export const AUTH = {
  LOGIN: 'api/v1/auth/login',
  REGISTER: 'api/v1/auth/register',
  LOGOUT: 'api/v1/auth/logout',
  LIST_ACCOUNTS: 'api/v1/auth/',
  UPDATE_USER: (id: string) => `api/v1/auth/users/${id}`,
  GET_USER: (id: string) => `api/v1/auth/users/${id}`,
} as const;

export const WORKSPACES = {
  LIST: 'api/v1/workspaces',
  CREATE: 'api/v1/workspaces',
  DEFAULT: 'api/v1/workspaces/default',
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
  MY_INVITATIONS: 'api/v1/workspaces/invitations',
} as const;

export const INVITATIONS = {
  ACCEPT: (invitationId: string) => `api/v1/invitations/${invitationId}/accept`,
  REJECT: (invitationId: string) => `api/v1/invitations/${invitationId}/reject`,
} as const;

export const BOARDS = {
  LIST: (workspaceId: string) => `api/v1/boards/workspaces/${workspaceId}/boards`,
  CREATE: (workspaceId: string) => `api/v1/boards/workspaces/${workspaceId}/boards`,
  DETAIL: (workspaceId: string, boardId: string) =>
    `api/v1/boards/workspaces/${workspaceId}/boards/${boardId}`,
  UPDATE: (workspaceId: string, boardId: string) =>
    `api/v1/boards/workspaces/${workspaceId}/boards/${boardId}`,
  DELETE: (workspaceId: string, boardId: string) =>
    `api/v1/boards/workspaces/${workspaceId}/boards/${boardId}`,
  LISTS: (workspaceId: string, boardId: string) =>
    `api/v1/boards/workspaces/${workspaceId}/boards/${boardId}/lists`,
  // Lists
  CREATE_LIST: (boardId: string) => `api/v1/boards/${boardId}/lists`,
  UPDATE_LIST: (listId: string) => `api/v1/boards/lists/${listId}`,
  DELETE_LIST: (listId: string) => `api/v1/boards/lists/${listId}`,
  LIST_CARDS: (listId: string) => `api/v1/boards/lists/${listId}/cards`,
  CREATE_CARD: (listId: string) => `api/v1/boards/lists/${listId}/cards`,
  // Cards
  CARD_DETAIL: (cardId: string) => `api/v1/boards/cards/${cardId}`,
  UPDATE_CARD: (cardId: string) => `api/v1/boards/cards/${cardId}`,
  DELETE_CARD: (cardId: string) => `api/v1/boards/cards/${cardId}`,
  MOVE_CARD: (cardId: string) => `api/v1/boards/cards/${cardId}/move`,
  ATTACH_LABEL: (cardId: string) => `api/v1/boards/cards/${cardId}/labels`,
  DETACH_LABEL: (cardId: string, labelId: string) =>
    `api/v1/boards/cards/${cardId}/labels/${labelId}`,
  SET_DUE_DATE: (cardId: string) => `api/v1/boards/cards/${cardId}/due-date`,
  CLEAR_DUE_DATE: (cardId: string) => `api/v1/boards/cards/${cardId}/due-date`,
  ASSIGN_MEMBER: (cardId: string) => `api/v1/boards/cards/${cardId}/members`,
  UNASSIGN_MEMBER: (cardId: string, memberId: string) =>
    `api/v1/boards/cards/${cardId}/members/${memberId}`,
  // Labels
  LABELS: (boardId: string) => `api/v1/boards/${boardId}/labels`,
  CREATE_LABEL: (boardId: string) => `api/v1/boards/${boardId}/labels`,
  UPDATE_LABEL: (boardId: string, labelId: string) =>
    `api/v1/boards/${boardId}/labels/${labelId}`,
  DELETE_LABEL: (boardId: string, labelId: string) =>
    `api/v1/boards/${boardId}/labels/${labelId}`,
} as const;

export const NOTIFICATIONS = {
  LIST: 'api/v1/notifications',
} as const;

export const STATISTICS = {
  WORKSPACE: (workspaceId: string) => `api/v1/statistics/${workspaceId}`,
  EXPORT: (workspaceId: string) => `api/v1/statistics/${workspaceId}/export`,
  ACTIVITIES: (workspaceId: string) => `api/v1/statistics/${workspaceId}/activities`,
  SELF_PERFORMANCE: (workspaceId: string) =>
    `api/v1/statistics/${workspaceId}/self-performance`,
  BOARD_METRICS: 'api/v1/boards/statistics/metrics',
  BOARD_ACTIVITIES: 'api/v1/boards/statistics/activities',
  BOARD_PRIORITIES: 'api/v1/boards/statistics/priorities',
  BOARD_WORKLOADS: 'api/v1/boards/statistics/workloads',
} as const;
