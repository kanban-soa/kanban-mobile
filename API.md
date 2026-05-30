# Kanban API Reference

Complete inventory of all API endpoints used by `kanban-web`. This document is a reference for building the mobile app's API integration.

## Configuration

### Base URLs

| Service | Env Var | Default |
| --- | --- | --- |
| Primary API gateway | `NEXT_PUBLIC_API_URL` | `http://localhost:8080` |
| Statistics service | `NEXT_PUBLIC_STATISTIC_SERVICE_URL` | falls back to primary |

### Authentication

- Bearer token stored in `localStorage` as `kanban:token` (web). Mobile should use secure storage (e.g. `expo-secure-store`).
- Refresh token stored as `refresh_token`.
- Token is injected via an Axios request interceptor in the `Authorization: Bearer <token>` header.
- A response interceptor logs the user out (clears storage) on `401` responses.
- All endpoints use `application/json`.

### Response Wrapping

Endpoints may return either the entity `T` directly or wrapped as `{ data: T }`. Client code unwraps both shapes.

---

## 1. Authentication

Source: `src/lib/api/auth.api.ts`

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | User login | `{ email, password }` | `{ token, refreshToken, user }` |
| POST | `/api/v1/auth/register` | User registration | `{ email, password, name }` | `{ token, refreshToken, user }` |
| POST | `/api/v1/auth/logout` | User logout | `{ refreshToken }` | `void` |
| GET | `/api/v1/auth/` | List all accounts | — | `Account[]` |
| GET | `/api/v1/auth/users/{id}` | Get user details | — | `Account` |
| PUT | `/api/v1/auth/users/{id}` | Update user profile | `Partial<Account>` | `Account` |

```ts
type Account = { id: string; email: string; name: string }
```

---

## 2. Workspaces

Source: `src/lib/api/workspace.api.ts`

### Workspace CRUD

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/workspaces` | List user's workspaces | — | `Workspace[]` |
| GET | `/api/v1/workspaces/default` | Get default workspace | — | `Workspace` |
| GET | `/api/v1/workspaces/{id}` | Get workspace details | — | `Workspace` |
| POST | `/api/v1/workspaces` | Create workspace | `{ name, description? }` | `{ data: Workspace }` |
| PATCH | `/api/v1/workspaces/{id}` | Update workspace | `{ name?, slug?, description? }` | `Workspace` |
| DELETE | `/api/v1/workspaces/{id}` | Soft-delete workspace | — | `void` |

### Workspace Members

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/workspaces/{workspaceId}/members` | List members | — | `MemberRequest[]` |
| POST | `/api/v1/workspaces/{workspaceId}/members` | Invite member by email | `{ email }` | `Invitation` |
| PATCH | `/api/v1/workspaces/{workspaceId}/members/{memberId}` | Change member role | `{ role: "admin" \| "member" }` | `Invitation` |
| DELETE | `/api/v1/workspaces/{workspaceId}/members/{memberId}` | Remove member | — | `void` |

### Invitations

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/workspaces/{workspaceId}/members/invitation` | List pending invitations for a workspace | — | `Invitation[]` |
| DELETE | `/api/v1/workspaces/{workspaceId}/members/invitation/{invitationId}` | Cancel a sent invitation | — | `void` |
| GET | `/api/v1/workspaces/invitations` | List current user's invitations | — | `Invitation[]` |
| PATCH | `/api/v1/invitations/{invitationId}/accept` | Accept invitation | — | `void` |
| PATCH | `/api/v1/invitations/{invitationId}/reject` | Reject invitation | — | `void` |

```ts
type Workspace = {
  id: number
  publicId: string
  slug: string
  plan: string
  name: string
  description?: string
  showEmailsToMembers: boolean
  createdBy: string
  createdAt: string
  updatedAt?: string
  deletedAt?: string
  deletedBy?: string
  boardIds?: string[]
  members?: number
}

type Member = {
  id: number
  publicId: string
  email: string
  name?: string
  userId: string
  workspaceId: number
  role: "admin" | "member"
  status: "active" | "invited" | "removed" | "cancelled"
  createdBy: string
  createdAt: string
}
```

---

## 3. Boards

Source: `src/lib/api/board.api.ts`

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/boards/workspaces/{workspaceId}/boards` | List boards in workspace | — | `Board[]` |
| POST | `/api/v1/boards/workspaces/{workspaceId}/boards` | Create board | `{ title, description? }` | `Board` |
| GET | `/api/v1/boards/workspaces/{workspaceId}/boards/{boardId}` | Get board details (with lists/cards) | — | `Board` |
| PATCH | `/api/v1/boards/workspaces/{workspaceId}/boards/{boardId}` | Update board | `{ title?, description? }` | `Board` |
| DELETE | `/api/v1/boards/workspaces/{workspaceId}/boards/{boardId}` | Soft-delete board | — | `void` |
| GET | `/api/v1/boards/workspaces/{workspaceId}/boards/{boardId}/lists` | List a board's lists (fallback) | — | `BoardList[]` |

```ts
type Board = {
  id: number
  publicId: string
  name: string
  title?: string
  description?: string
  slug: string
  workspaceId: number
  visibility: "public" | "private"
  type: string
  sourceBoardId?: number
  createdBy: string
  createdAt: string
  allLists?: BoardList[]
  lists?: BoardList[]
}
```

---

## 4. Lists

Source: `src/lib/api/board.api.ts`

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/boards/{boardId}/lists` | Create list in board | `{ name, position? }` | `BoardList` |
| PATCH | `/api/v1/boards/lists/{listId}` | Rename / reorder list | `{ name?, position? }` | `BoardList` |
| DELETE | `/api/v1/boards/lists/{listId}` | Soft-delete list | — | `void` |
| GET | `/api/v1/boards/lists/{listId}/cards` | Get cards in list | — | `Card[]` |
| POST | `/api/v1/boards/lists/{listId}/cards` | Create card in list | `{ title, description? }` | `Card` |

```ts
type BoardList = {
  id: string | number
  publicId?: string
  name: string
  index?: number
  position?: number
  boardId: string | number
  createdAt?: string
  updatedAt?: string
}
```

---

## 5. Cards

Source: `src/lib/api/board.api.ts`

### Card CRUD

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/boards/cards/{cardId}` | Get card details (with labels & members) | — | `Card` |
| PATCH | `/api/v1/boards/cards/{cardId}` | Update card | `{ title?, description? }` | `Card` |
| DELETE | `/api/v1/boards/cards/{cardId}` | Soft-delete card | — | `void` |
| PATCH | `/api/v1/boards/cards/{cardId}/move` | Move card between lists / reorder | `{ targetListId, newIndex? }` | `Card` |

### Card Labels

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/boards/cards/{cardId}/labels` | Attach label to card | `{ labelId }` | `void` |
| DELETE | `/api/v1/boards/cards/{cardId}/labels/{labelId}` | Detach label from card | — | `void` |

### Card Due Date

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| PATCH | `/api/v1/boards/cards/{cardId}/due-date` | Set due date | `{ dueDate: ISOString }` | `Card` |
| DELETE | `/api/v1/boards/cards/{cardId}/due-date` | Clear due date | — | `Card` |

### Card Members

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/boards/cards/{cardId}/members` | Assign member to card | `{ workspaceMemberPublicId }` | `void` |
| DELETE | `/api/v1/boards/cards/{cardId}/members/{memberId}` | Unassign member from card | — | `void` |

```ts
type Card = {
  id: string
  publicId?: string
  title: string
  description?: string
  listId: string
  list?: { publicId: string; name: string }
  position?: number
  dueDate?: string | null
  labels?: Label[]
  members?: string[]
  createdAt?: string
  updatedAt?: string
}
```

---

## 6. Labels

Source: `src/lib/api/board.api.ts`

| Method | Endpoint | Purpose | Request Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/boards/{boardId}/labels` | List labels on a board | — | `Label[]` |
| POST | `/api/v1/boards/{boardId}/labels` | Create label | `{ name, colourCode }` | `Label` |
| PATCH | `/api/v1/boards/{boardId}/labels/{labelId}` | Update label | `{ name?, colourCode? }` | `Label` |
| DELETE | `/api/v1/boards/{boardId}/labels/{labelId}` | Soft-delete label | — | `void` |

```ts
type Label = {
  id: string
  publicId?: string
  name: string
  color: string
  colourCode?: string
  boardId: string
}
```

---

## 7. Statistics & Analytics

Source: `src/lib/api/statistics.api.ts`

Uses the statistics service base URL when configured (`NEXT_PUBLIC_STATISTIC_SERVICE_URL`).

### Workspace-Level

| Method | Endpoint | Purpose | Query | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/statistics/{workspaceId}` | Workspace summary metrics | `range=7d \| 30d \| 90d` | `StatisticsSummary` |
| GET | `/api/v1/statistics/{workspaceId}/export` | Export statistics file | `range=7d\|30d\|90d&format=csv\|json` | `Blob` |
| GET | `/api/v1/statistics/{workspaceId}/activities` | Workspace activity log (paged) | `page, limit, actionType, entityType, entityId, actorUserId, from, to` | `PagedActivityResponse` |
| GET | `/api/v1/statistics/{workspaceId}/self-performance` | Current user's performance | `range=7d \| 30d \| 90d` | `StatisticsSelfPerformance` |

### Board-Level

| Method | Endpoint | Purpose | Response |
| --- | --- | --- | --- |
| GET | `/api/v1/boards/statistics/metrics` | Board metrics | generic `T` |
| GET | `/api/v1/boards/statistics/activities` | Board activity stats | generic `T` |
| GET | `/api/v1/boards/statistics/priorities` | Priority distribution | generic `T` |
| GET | `/api/v1/boards/statistics/workloads` | Team workload distribution | generic `T` |

```ts
type StatisticsSummary = {
  range: "7d" | "30d" | "90d"
  metrics: {
    completed: number; updated: number; created: number; dueSoon: number
    completedTrend: number; updatedTrend: number; createdTrend: number; dueSoonTrend: number
  }
  priorities: Array<{ label: string; value: number; color: string }>
  workloads: Array<{ name: string; capacity: number; state: string }>
}

type Activity = {
  id: number
  publicId: string
  workspaceId: number
  actorUserId: string
  actionType:
    | "card.created" | "card.updated" | "card.deleted" | "card.archived"
    | "board.created" | "board.updated" | "board.deleted"
  entityType: "card" | "board"
  entityId: string
  metadata: {
    title?: string; name?: string; boardName?: string; listName?: string
    actor?: unknown; entity?: unknown
  }
  createdAt: string
}

type PagedActivityResponse = {
  items: Activity[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}
```

---

## 8. Notifications

Source: `src/lib/api/routes.ts` — defined but not yet wired up in web client.

| Method | Endpoint | Purpose | Response |
| --- | --- | --- | --- |
| GET | `/api/v1/notifications` | List notifications | `Notification[]` |

---

## Source File Map

| File | Responsibility |
| --- | --- |
| `src/lib/api/axios.ts` | Axios instance, auth header interceptor, 401 auto-logout |
| `src/lib/api/routes.ts` | Centralized endpoint path constants |
| `src/lib/api/types.ts` | Shared API type definitions |
| `src/lib/api/auth.api.ts` | Auth endpoints (6) |
| `src/lib/api/workspace.api.ts` | Workspace + member endpoints (15) |
| `src/lib/api/board.api.ts` | Boards, lists, cards, labels (25) |
| `src/lib/api/statistics.api.ts` | Statistics + activities (8) |
| `src/hooks/use-auth.ts` | React Query hooks: auth |
| `src/hooks/use-workspaces.ts` | React Query hooks: workspaces |
| `src/hooks/use-board.ts` | React Query hooks: boards/lists/cards |
| `src/hooks/use-statistics.ts` | React Query hooks: statistics |

---

## Endpoint Totals

| Domain | Count |
| --- | --- |
| Authentication | 6 |
| Workspaces (incl. members & invitations) | 15 |
| Boards | 6 |
| Lists | 5 |
| Cards | 10 |
| Labels | 4 |
| Statistics | 8 |
| Notifications (unused) | 1 |
| **Total** | **55** |
