import { create } from 'zustand';

interface UserState {
  user: null | { name: string };
  setUser: (user: { name: string }) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
