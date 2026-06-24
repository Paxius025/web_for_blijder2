import { create } from 'zustand';
import { API_BASE_URL } from '../constants/api';

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  emergency_contact?: string;
  disability_details?: string;
  role: 'caregiver' | 'admin';
  device_serial?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = 'auth-storage';

function loadFromStorage(): Partial<AuthState> {
  try {
    if (typeof window === 'undefined') return {};
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveToStorage(data: { user: User | null; token: string | null; isAuthenticated: boolean }) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const saved = loadFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  user: saved.user ?? null,
  token: saved.token ?? null,
  isAuthenticated: saved.isAuthenticated ?? false,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) { set({ isLoading: false }); return false; }

      const user = await res.json();
      saveToStorage({ user, token: null, isAuthenticated: true });
      set({ isAuthenticated: true, isLoading: false, user });
      return true;
    } catch (e) {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    saveToStorage({ user: null, token: null, isAuthenticated: false });
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
