import { create } from 'zustand';
import { API_BASE_URL } from '../constants/api';

interface User {
  user_id: number;
  full_name: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,


login: async (username, password) => {
  set({ isLoading: true });
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      set({ isLoading: false });
      return false;
    }

    const user = await res.json();
    set({ isAuthenticated: true, isLoading: false, user });
    return true;

  } catch (e) {
    console.error('Login error:', e);
    set({ isLoading: false });
    return false;
  }
},

  logout: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
  }),
}));