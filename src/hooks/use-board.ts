import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  assignCardMember,
  attachCardLabel,
  clearCardDueDate,
  createBoard,
  createCard,
  createLabel,
  createList,
  deleteBoard,
  deleteCard,
  deleteLabel,
  deleteList,
  detachCardLabel,
  getBoard,
  getCard,
  listBoardLists,
  listBoards,
  listCardsInList,
  listLabels,
  moveCard,
  setCardDueDate,
  unassignCardMember,
  updateBoard,
  updateCard,
  updateLabel,
  updateList,
} from '~/features/boards/board.api';
import type {
  CreateBoardRequest,
  CreateCardRequest,
  CreateLabelRequest,
  CreateListRequest,
  MoveCardRequest,
  UpdateBoardRequest,
  UpdateCardRequest,
  UpdateLabelRequest,
  UpdateListRequest,
} from '~/lib/api/types';

// ── Boards ────────────────────────────────────────────────────────────────────

export function useBoards(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'boards'],
    queryFn: () => listBoards(workspaceId as string),
    enabled: !!workspaceId,
  });
}

export function useBoard(
  workspaceId: string | undefined,
  boardId: string | undefined,
) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'boards', boardId],
    queryFn: () => getBoard(workspaceId as string, boardId as string),
    enabled: !!workspaceId && !!boardId,
  });
}

export function useCreateBoard(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBoardRequest) => createBoard(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards'],
      });
    },
  });
}

export function useUpdateBoard(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      boardId,
      payload,
    }: {
      boardId: string;
      payload: UpdateBoardRequest;
    }) => updateBoard(workspaceId, boardId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards'],
      });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards', variables.boardId],
      });
    },
  });
}

export function useDeleteBoard(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(workspaceId, boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'boards'],
      });
    },
  });
}

export function useBoardLists(
  workspaceId: string | undefined,
  boardId: string | undefined,
) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'boards', boardId, 'lists'],
    queryFn: () => listBoardLists(workspaceId as string, boardId as string),
    enabled: !!workspaceId && !!boardId,
  });
}

// ── Lists ─────────────────────────────────────────────────────────────────────

export function useCreateList(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateListRequest) => createList(boardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listId,
      payload,
    }: {
      listId: string;
      payload: UpdateListRequest;
    }) => updateList(listId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId: string) => deleteList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useCardsInList(listId: string | undefined) {
  return useQuery({
    queryKey: ['lists', listId, 'cards'],
    queryFn: () => listCardsInList(listId as string),
    enabled: !!listId,
  });
}

// ── Cards ─────────────────────────────────────────────────────────────────────

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listId,
      payload,
    }: {
      listId: string;
      payload: CreateCardRequest;
    }) => createCard(listId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lists', variables.listId, 'cards'],
      });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useCard(cardId: string | undefined) {
  return useQuery({
    queryKey: ['cards', cardId],
    queryFn: () => getCard(cardId as string),
    enabled: !!cardId,
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      payload,
    }: {
      cardId: string;
      payload: UpdateCardRequest;
    }) => updateCard(cardId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      payload,
    }: {
      cardId: string;
      payload: MoveCardRequest;
    }) => moveCard(cardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useAttachCardLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      labelId,
    }: {
      cardId: string;
      labelId: string;
    }) => attachCardLabel(cardId, labelId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useDetachCardLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      labelId,
    }: {
      cardId: string;
      labelId: string;
    }) => detachCardLabel(cardId, labelId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useSetCardDueDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, dueDate }: { cardId: string; dueDate: string }) =>
      setCardDueDate(cardId, dueDate),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useClearCardDueDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => clearCardDueDate(cardId),
    onSuccess: (_data, cardId) => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useAssignCardMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      workspaceMemberPublicId,
    }: {
      cardId: string;
      workspaceMemberPublicId: string;
    }) => assignCardMember(cardId, workspaceMemberPublicId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useUnassignCardMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      memberId,
    }: {
      cardId: string;
      memberId: string;
    }) => unassignCardMember(cardId, memberId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cards', variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

// ── Labels ────────────────────────────────────────────────────────────────────

export function useLabels(boardId: string | undefined) {
  return useQuery({
    queryKey: ['boards', boardId, 'labels'],
    queryFn: () => listLabels(boardId as string),
    enabled: !!boardId,
  });
}

export function useCreateLabel(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLabelRequest) => createLabel(boardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'labels'] });
    },
  });
}

export function useUpdateLabel(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      labelId,
      payload,
    }: {
      labelId: string;
      payload: UpdateLabelRequest;
    }) => updateLabel(boardId, labelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'labels'] });
    },
  });
}

export function useDeleteLabel(boardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => deleteLabel(boardId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId, 'labels'] });
    },
  });
}
