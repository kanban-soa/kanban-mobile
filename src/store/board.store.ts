import { create } from 'zustand';

export type BoardLabel = {
  id: string;
  name: string;
  color: string;
};

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  labelIds: string[];
  memberIds: string[];
  dueDate: string | null;
};

export type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

export type Board = {
  id: string;
  title: string;
  description: string;
  columns: Column[];
  labels: BoardLabel[];
};

type BoardState = {
  boards: Record<string, Board>;
  members: WorkspaceMember[];
  ensureBoard: (boardId: string, defaultName: string) => void;
  updateBoardMeta: (boardId: string, patch: Partial<Pick<Board, 'title' | 'description'>>) => void;
  addColumn: (boardId: string, title: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  addCard: (boardId: string, columnId: string, title: string) => string;
  updateCard: (boardId: string, cardId: string, patch: Partial<Task>) => void;
  deleteCard: (boardId: string, cardId: string) => void;
  moveCard: (boardId: string, cardId: string, targetColumnId: string) => void;
  addLabel: (boardId: string, payload: Omit<BoardLabel, 'id'>) => void;
  updateLabel: (boardId: string, labelId: string, payload: Omit<BoardLabel, 'id'>) => void;
  deleteLabel: (boardId: string, labelId: string) => void;
  toggleCardLabel: (boardId: string, cardId: string, labelId: string) => void;
  toggleCardMember: (boardId: string, cardId: string, memberId: string) => void;
  setCardDueDate: (boardId: string, cardId: string, dueDate: string | null) => void;
  findCard: (boardId: string, cardId: string) => { task: Task; columnId: string } | null;
};

const DEFAULT_LABELS: BoardLabel[] = [
  { id: 'l-1', name: 'Bug', color: '#ef4444' },
  { id: 'l-2', name: 'Feature', color: '#3b82f6' },
  { id: 'l-3', name: 'Design', color: '#a855f7' },
];

const DEFAULT_MEMBERS: WorkspaceMember[] = [
  { id: 'u-1', name: 'John Doe', email: 'john@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: 'u-2', name: 'Jane Smith', email: 'jane@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: 'u-3', name: 'Bob Johnson', email: 'bob@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
];

const createDefaultBoard = (id: string, title: string): Board => ({
  id,
  title,
  description: 'Plan and track tasks for this board.',
  labels: DEFAULT_LABELS,
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        { id: '1', title: 'Design landing page', description: 'Hero, value props, CTA.', labelIds: ['l-3'], memberIds: ['u-1'], dueDate: null },
        { id: '2', title: 'Set up database', description: '', labelIds: [], memberIds: [], dueDate: null },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        { id: '3', title: 'Implement authentication', description: 'JWT-based flow.', labelIds: ['l-2'], memberIds: ['u-2', 'u-3'], dueDate: '2026-06-15' },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: '4', title: 'Project scaffolding', description: '', labelIds: [], memberIds: [], dueDate: null },
      ],
    },
  ],
});

const updateBoardIn = (
  boards: Record<string, Board>,
  boardId: string,
  updater: (b: Board) => Board,
): Record<string, Board> => {
  const board = boards[boardId];
  if (!board) return boards;
  return { ...boards, [boardId]: updater(board) };
};

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: {},
  members: DEFAULT_MEMBERS,

  ensureBoard: (boardId, defaultName) =>
    set((state) => {
      if (state.boards[boardId]) return state;
      return { boards: { ...state.boards, [boardId]: createDefaultBoard(boardId, defaultName) } };
    }),

  updateBoardMeta: (boardId, patch) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({ ...b, ...patch })),
    })),

  addColumn: (boardId, title) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        columns: [...b.columns, { id: `col-${Date.now()}`, title, tasks: [] }],
      })),
    })),

  deleteColumn: (boardId, columnId) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        columns: b.columns.filter((c) => c.id !== columnId),
      })),
    })),

  addCard: (boardId, columnId, title) => {
    const newId = `t-${Date.now()}`;
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        columns: b.columns.map((c) =>
          c.id === columnId
            ? {
                ...c,
                tasks: [
                  ...c.tasks,
                  { id: newId, title, description: '', labelIds: [], memberIds: [], dueDate: null },
                ],
              }
            : c,
        ),
      })),
    }));
    return newId;
  },

  updateCard: (boardId, cardId, patch) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        columns: b.columns.map((c) => ({
          ...c,
          tasks: c.tasks.map((t) => (t.id === cardId ? { ...t, ...patch } : t)),
        })),
      })),
    })),

  deleteCard: (boardId, cardId) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        columns: b.columns.map((c) => ({
          ...c,
          tasks: c.tasks.filter((t) => t.id !== cardId),
        })),
      })),
    })),

  moveCard: (boardId, cardId, targetColumnId) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => {
        let moving: Task | null = null;
        const columnsWithoutCard = b.columns.map((c) => {
          const found = c.tasks.find((t) => t.id === cardId);
          if (found) {
            moving = found;
            return { ...c, tasks: c.tasks.filter((t) => t.id !== cardId) };
          }
          return c;
        });
        if (!moving) return b;
        return {
          ...b,
          columns: columnsWithoutCard.map((c) =>
            c.id === targetColumnId ? { ...c, tasks: [...c.tasks, moving as Task] } : c,
          ),
        };
      }),
    })),

  addLabel: (boardId, payload) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        labels: [...b.labels, { ...payload, id: `l-${Date.now()}` }],
      })),
    })),

  updateLabel: (boardId, labelId, payload) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        labels: b.labels.map((l) => (l.id === labelId ? { ...l, ...payload } : l)),
      })),
    })),

  deleteLabel: (boardId, labelId) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        labels: b.labels.filter((l) => l.id !== labelId),
        columns: b.columns.map((c) => ({
          ...c,
          tasks: c.tasks.map((t) => ({
            ...t,
            labelIds: t.labelIds.filter((id) => id !== labelId),
          })),
        })),
      })),
    })),

  toggleCardLabel: (boardId, cardId, labelId) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        columns: b.columns.map((c) => ({
          ...c,
          tasks: c.tasks.map((t) =>
            t.id === cardId
              ? {
                  ...t,
                  labelIds: t.labelIds.includes(labelId)
                    ? t.labelIds.filter((id) => id !== labelId)
                    : [...t.labelIds, labelId],
                }
              : t,
          ),
        })),
      })),
    })),

  toggleCardMember: (boardId, cardId, memberId) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        columns: b.columns.map((c) => ({
          ...c,
          tasks: c.tasks.map((t) =>
            t.id === cardId
              ? {
                  ...t,
                  memberIds: t.memberIds.includes(memberId)
                    ? t.memberIds.filter((id) => id !== memberId)
                    : [...t.memberIds, memberId],
                }
              : t,
          ),
        })),
      })),
    })),

  setCardDueDate: (boardId, cardId, dueDate) =>
    set((state) => ({
      boards: updateBoardIn(state.boards, boardId, (b) => ({
        ...b,
        columns: b.columns.map((c) => ({
          ...c,
          tasks: c.tasks.map((t) => (t.id === cardId ? { ...t, dueDate } : t)),
        })),
      })),
    })),

  findCard: (boardId, cardId) => {
    const board = get().boards[boardId];
    if (!board) return null;
    for (const c of board.columns) {
      const task = c.tasks.find((t) => t.id === cardId);
      if (task) return { task, columnId: c.id };
    }
    return null;
  },
}));
