import { api } from '~/lib/api';
import { BOARDS } from '~/lib/api/routes';
import type {
  Board,
  BoardList,
  Card,
  CreateBoardRequest,
  CreateCardRequest,
  CreateLabelRequest,
  CreateListRequest,
  Label,
  MoveCardRequest,
  UpdateBoardRequest,
  UpdateCardRequest,
  UpdateLabelRequest,
  UpdateListRequest,
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

// ── Boards ────────────────────────────────────────────────────────────────────

export async function listBoards(workspaceId: string): Promise<Board[]> {
  const data = await api
    .get(BOARDS.LIST(workspaceId))
    .json<Board[] | { data: Board[] }>();
  return unwrap(data);
}

export async function getBoard(
  workspaceId: string,
  boardId: string,
): Promise<Board> {
  const data = await api
    .get(BOARDS.DETAIL(workspaceId, boardId))
    .json<Board | { data: Board }>();
  return unwrapOne(data);
}

export async function createBoard(
  workspaceId: string,
  payload: CreateBoardRequest,
): Promise<Board> {
  const data = await api
    .post(BOARDS.CREATE(workspaceId), { json: payload })
    .json<Board | { data: Board }>();
  return unwrapOne(data);
}

export async function updateBoard(
  workspaceId: string,
  boardId: string,
  payload: UpdateBoardRequest,
): Promise<Board> {
  const data = await api
    .patch(BOARDS.UPDATE(workspaceId, boardId), { json: payload })
    .json<Board | { data: Board }>();
  return unwrapOne(data);
}

export async function deleteBoard(
  workspaceId: string,
  boardId: string,
): Promise<void> {
  await api.delete(BOARDS.DELETE(workspaceId, boardId));
}

export async function listBoardLists(
  workspaceId: string,
  boardId: string,
): Promise<BoardList[]> {
  const data = await api
    .get(BOARDS.LISTS(workspaceId, boardId))
    .json<BoardList[] | { data: BoardList[] }>();
  return unwrap(data);
}

// ── Lists ─────────────────────────────────────────────────────────────────────

export async function createList(
  boardId: string,
  payload: CreateListRequest,
): Promise<BoardList> {
  const data = await api
    .post(BOARDS.CREATE_LIST(boardId), { json: payload })
    .json<BoardList | { data: BoardList }>();
  return unwrapOne(data);
}

export async function updateList(
  listId: string,
  payload: UpdateListRequest,
): Promise<BoardList> {
  const data = await api
    .patch(BOARDS.UPDATE_LIST(listId), { json: payload })
    .json<BoardList | { data: BoardList }>();
  return unwrapOne(data);
}

export async function deleteList(listId: string): Promise<void> {
  await api.delete(BOARDS.DELETE_LIST(listId));
}

export async function listCardsInList(listId: string): Promise<Card[]> {
  const data = await api
    .get(BOARDS.LIST_CARDS(listId))
    .json<Card[] | { data: Card[] }>();
  return unwrap(data);
}

// ── Cards ─────────────────────────────────────────────────────────────────────

export async function createCard(
  listId: string,
  payload: CreateCardRequest,
): Promise<Card> {
  const data = await api
    .post(BOARDS.CREATE_CARD(listId), { json: payload })
    .json<Card | { data: Card }>();
  return unwrapOne(data);
}

export async function getCard(cardId: string): Promise<Card> {
  const data = await api
    .get(BOARDS.CARD_DETAIL(cardId))
    .json<Card | { data: Card }>();
  return unwrapOne(data);
}

export async function updateCard(
  cardId: string,
  payload: UpdateCardRequest,
): Promise<Card> {
  const data = await api
    .patch(BOARDS.UPDATE_CARD(cardId), { json: payload })
    .json<Card | { data: Card }>();
  return unwrapOne(data);
}

export async function deleteCard(cardId: string): Promise<void> {
  await api.delete(BOARDS.DELETE_CARD(cardId));
}

export async function moveCard(
  cardId: string,
  payload: MoveCardRequest,
): Promise<Card> {
  const data = await api
    .patch(BOARDS.MOVE_CARD(cardId), { json: payload })
    .json<Card | { data: Card }>();
  return unwrapOne(data);
}

export async function attachCardLabel(
  cardId: string,
  labelId: string,
): Promise<void> {
  await api.post(BOARDS.ATTACH_LABEL(cardId), { json: { labelId } });
}

export async function detachCardLabel(
  cardId: string,
  labelId: string,
): Promise<void> {
  await api.delete(BOARDS.DETACH_LABEL(cardId, labelId));
}

export async function setCardDueDate(
  cardId: string,
  dueDate: string,
): Promise<Card> {
  const data = await api
    .patch(BOARDS.SET_DUE_DATE(cardId), { json: { dueDate } })
    .json<Card | { data: Card }>();
  return unwrapOne(data);
}

export async function clearCardDueDate(cardId: string): Promise<Card> {
  const data = await api
    .delete(BOARDS.CLEAR_DUE_DATE(cardId))
    .json<Card | { data: Card }>();
  return unwrapOne(data);
}

export async function assignCardMember(
  cardId: string,
  workspaceMemberPublicId: string,
): Promise<void> {
  await api.post(BOARDS.ASSIGN_MEMBER(cardId), {
    json: { workspaceMemberPublicId },
  });
}

export async function unassignCardMember(
  cardId: string,
  memberId: string,
): Promise<void> {
  await api.delete(BOARDS.UNASSIGN_MEMBER(cardId, memberId));
}

// ── Labels ────────────────────────────────────────────────────────────────────

export async function listLabels(boardId: string): Promise<Label[]> {
  const data = await api
    .get(BOARDS.LABELS(boardId))
    .json<Label[] | { data: Label[] }>();
  return unwrap(data);
}

export async function createLabel(
  boardId: string,
  payload: CreateLabelRequest,
): Promise<Label> {
  const data = await api
    .post(BOARDS.CREATE_LABEL(boardId), { json: payload })
    .json<Label | { data: Label }>();
  return unwrapOne(data);
}

export async function updateLabel(
  boardId: string,
  labelId: string,
  payload: UpdateLabelRequest,
): Promise<Label> {
  const data = await api
    .patch(BOARDS.UPDATE_LABEL(boardId, labelId), { json: payload })
    .json<Label | { data: Label }>();
  return unwrapOne(data);
}

export async function deleteLabel(
  boardId: string,
  labelId: string,
): Promise<void> {
  await api.delete(BOARDS.DELETE_LABEL(boardId, labelId));
}
