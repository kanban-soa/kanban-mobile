/**
 * Shared API types — mirrors kanban-web/src/lib/api/types.ts.
 */

export type WorkspaceRole = 'admin' | 'member' | 'owner' | 'observer';

export type MemberStatus = 'active' | 'invited' | 'removed' | 'cancelled';

export type Workspace = {
  id: number;
  publicId: string;
  slug: string;
  plan: string;
  name: string;
  description?: string;
  showEmailsToMembers?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  deletedBy?: string;
  boardIds?: string[];
  members?: number;
};

export type Account = {
  id: string;
  email: string;
  name: string;
};

export type MemberRequest = {
  id: number;
  publicId: string;
  email: string;
  name: string | null;
  userId: string;
  workspaceId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  role: string;
  roleId: string | null;
  status: string;
};

export type Invitation = {
  id: string;
  publicId: string;
  email: string;
  role: WorkspaceRole;
  sentAt: string;
  workspace: string;
};

export type CreateWorkspaceRequest = {
  name: string;
  description?: string;
};

export type UpdateWorkspaceRequest = {
  name?: string;
  slug?: string;
  description?: string;
};

export type InviteMemberRequest = {
  email: string;
};

export type ChangeRoleRequest = {
  role: WorkspaceRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type AuthResponse = {
  token: string;
  refreshToken: string;
  user: Account;
};

// ── Boards / Lists / Cards / Labels ──────────────────────────────────────────

export type Board = {
  id: number;
  publicId: string;
  name: string;
  title?: string;
  description?: string;
  slug: string;
  workspaceId: number;
  visibility: 'public' | 'private';
  type: string;
  sourceBoardId?: number;
  createdBy: string;
  createdAt: string;
  allLists?: BoardList[];
  lists?: BoardList[];
};

export type CreateBoardRequest = {
  title: string;
  description?: string;
};

export type UpdateBoardRequest = {
  title?: string;
  description?: string;
};

export type BoardList = {
  id: string | number;
  publicId?: string;
  name: string;
  index?: number;
  position?: number;
  boardId: string | number;
  cards?: Card[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateListRequest = {
  name: string;
  position?: number;
};

export type UpdateListRequest = {
  name?: string;
  position?: number;
};

export type Card = {
  id: string;
  publicId?: string;
  title: string;
  description?: string;
  listId: string;
  list?: { publicId: string; name: string };
  position?: number;
  dueDate?: string | null;
  labels?: Label[];
  members?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCardRequest = {
  title: string;
  description?: string;
};

export type UpdateCardRequest = {
  title?: string;
  description?: string;
};

export type MoveCardRequest = {
  targetListId: string;
  newIndex?: number;
};

export type Label = {
  id: string;
  publicId?: string;
  name: string;
  color: string;
  colourCode?: string;
  boardId: string;
};

export type CreateLabelRequest = {
  name: string;
  colourCode: string;
};

export type UpdateLabelRequest = {
  name?: string;
  colourCode?: string;
};

// ── Statistics ────────────────────────────────────────────────────────────────

export type StatisticsRange = '7d' | '30d' | '90d';

export type StatisticsSummary = {
  range: StatisticsRange;
  metrics: {
    completed: number;
    updated: number;
    created: number;
    dueSoon: number;
    completedTrend: number;
    updatedTrend: number;
    createdTrend: number;
    dueSoonTrend: number;
  };
  priorities: Array<{ label: string; value: number; color: string }>;
  workloads: Array<{ name: string; capacity: number; state: string }>;
};

export type StatisticsSelfPerformance = {
  range: StatisticsRange;
  completedTotal: number;
  overdueTotal: number;
  comparisonPercentage: number;
  completedPercentage: number;
  overdueTasks?: Array<{ id: string; title: string; dueDate: string }>;
};

export type Activity = {
  id: number;
  publicId: string;
  workspaceId: number;
  actorUserId: string;
  actionType:
    | 'card.created'
    | 'card.updated'
    | 'card.deleted'
    | 'card.archived'
    | 'board.created'
    | 'board.updated'
    | 'board.deleted';
  entityType: 'card' | 'board';
  entityId: string;
  metadata: {
    title?: string;
    name?: string;
    boardName?: string;
    listName?: string;
    actor?: unknown;
    entity?: unknown;
  };
  createdAt: string;
};

export type PagedActivityResponse = {
  items: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ActivityQuery = {
  page?: number;
  limit?: number;
  actionType?: string;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  from?: string;
  to?: string;
};
