'use client';

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: {
    id: 'user-demo-1',
    email: 'explorer@atlas.journal',
    fullName: 'Atlas Explorer',
  },
  isLoading: false,

  signIn: async (email: string, pass: string) => {
    set({ isLoading: true });
    // Simulate brief authentication check
    await new Promise((r) => setTimeout(r, 600));

    set({
      user: {
        id: `user-${Date.now()}`,
        email,
        fullName: email.split('@')[0],
      },
      isLoading: false,
    });
    return { success: true };
  },

  signUp: async (email: string, pass: string, name: string) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 600));

    set({
      user: {
        id: `user-${Date.now()}`,
        email,
        fullName: name || email.split('@')[0],
      },
      isLoading: false,
    });
    return { success: true };
  },

  signOut: async () => {
    set({ user: null });
  },
}));
