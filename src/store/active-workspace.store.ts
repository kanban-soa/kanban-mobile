import { create } from 'zustand';

export type ActiveWorkspace = {
  id: string;
  name: string;
};

type ActiveWorkspaceState = {
  activeWorkspace: ActiveWorkspace | null;
  setActiveWorkspace: (workspace: ActiveWorkspace) => void;
  clearActiveWorkspace: () => void;
};

export const useActiveWorkspaceStore = create<ActiveWorkspaceState>((set) => ({
  activeWorkspace: null,
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  clearActiveWorkspace: () => set({ activeWorkspace: null }),
}));
