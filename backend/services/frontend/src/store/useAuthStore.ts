import { create } from 'zustand';

interface AuthState {
  token: string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  logout: () => set({ token: null }),
}));
