'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAtlasStore } from '@/lib/store';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  isGuest?: boolean;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  needsEmailVerification?: boolean;
  message?: string;
}

interface AuthState {
  user: AuthUser | null;
  session: any | null;
  isLoading: boolean;
  isInitialized: boolean;
  authError: string | null;

  signIn: (email: string, pass: string) => Promise<AuthResponse>;
  signUp: (email: string, pass: string, name: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  continueAsGuest: () => AuthResponse;
  resendVerification: (email: string) => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  initAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  authError: null,

  signIn: async (email: string, pass: string): Promise<AuthResponse> => {
    set({ isLoading: true, authError: null });

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      set({ isLoading: false, authError: 'Please enter both email and password.' });
      return { success: false, error: 'Please enter both email and password.' };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        let userMessage = error.message;

        if (
          error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('not confirmed')
        ) {
          userMessage =
            'Your email address has not been confirmed yet. Please check your inbox or spam folder for the verification link.';
          set({ isLoading: false, authError: userMessage });
          return { success: false, error: userMessage, needsEmailVerification: true };
        }

        if (error.message.toLowerCase().includes('invalid login credentials')) {
          userMessage = 'Incorrect email or password. Please try again.';
        }

        set({ isLoading: false, authError: userMessage });
        return { success: false, error: userMessage };
      }

      if (data?.session && data?.user) {
        // Clear any leftover guest cookie since user is now signed in
        if (typeof document !== 'undefined') {
          document.cookie = 'atlas_guest_mode=; path=/; max-age=0; SameSite=Lax';
        }

        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          cleanEmail.split('@')[0];

        set({
          user: {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            fullName,
            avatarUrl: data.user.user_metadata?.avatar_url || null,
            isGuest: false,
          },
          session: data.session,
          isLoading: false,
          authError: null,
        });

        return { success: true };
      }

      set({ isLoading: false, authError: 'Could not establish session.' });
      return { success: false, error: 'Could not establish session. Please try again.' };
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please check your connection.';
      set({ isLoading: false, authError: msg });
      return { success: false, error: msg };
    }
  },

  signUp: async (email: string, pass: string, name: string): Promise<AuthResponse> => {
    set({ isLoading: true, authError: null });

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !pass || !cleanName) {
      set({ isLoading: false, authError: 'All fields are required.' });
      return { success: false, error: 'All fields are required.' };
    }

    if (pass.length < 6) {
      set({ isLoading: false, authError: 'Password must be at least 6 characters.' });
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/api/auth/callback`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: cleanName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        let msg = error.message;
        if (error.message.toLowerCase().includes('user already registered')) {
          msg = 'An account with this email already exists. Please sign in instead.';
        }
        set({ isLoading: false, authError: msg });
        return { success: false, error: msg };
      }

      // Check if email confirmation is required (data.user exists, but data.session is null)
      if (data?.user && !data?.session) {
        set({ isLoading: false, authError: null });
        return {
          success: true,
          needsEmailVerification: true,
          message:
            'Account created! We have sent a verification link to your email. Please verify your address to sign in.',
        };
      }

      if (data?.session && data?.user) {
        if (typeof document !== 'undefined') {
          document.cookie = 'atlas_guest_mode=; path=/; max-age=0; SameSite=Lax';
        }

        set({
          user: {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            fullName: cleanName,
            isGuest: false,
          },
          session: data.session,
          isLoading: false,
          authError: null,
        });

        return { success: true };
      }

      set({ isLoading: false });
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Registration failed. Please check your connection.';
      set({ isLoading: false, authError: msg });
      return { success: false, error: msg };
    }
  },

  continueAsGuest: (): AuthResponse => {
    if (typeof document !== 'undefined') {
      document.cookie = 'atlas_guest_mode=true; path=/; max-age=2592000; SameSite=Lax';
    }

    set({
      user: {
        id: 'guest-explorer',
        email: 'guest@atlas.journal',
        fullName: 'Guest Explorer',
        isGuest: true,
      },
      session: null,
      isLoading: false,
      authError: null,
    });

    return { success: true };
  },

  resendVerification: async (email: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'A fresh confirmation email has been dispatched. Please check your inbox.',
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to resend confirmation.' };
    }
  },

  resetPassword: async (email: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/login?reset=true`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Password reset link sent! Please check your email inbox.',
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send password reset.' };
    }
  },

  signOut: async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      if (typeof document !== 'undefined') {
        document.cookie = 'atlas_guest_mode=; path=/; max-age=0; SameSite=Lax';
      }
      try {
        useAtlasStore.getState().resetStore();
      } catch (e) {
        console.warn('Store reset error:', e);
      }
      set({ user: null, session: null, isLoading: false, authError: null });
    }
  },

  initAuth: async () => {
    if (get().isInitialized) return;

    try {
      // 1. Check guest cookie
      const isGuestCookie =
        typeof document !== 'undefined' &&
        document.cookie.includes('atlas_guest_mode=true');

      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        const u = data.session.user;
        const fullName =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.email?.split('@')[0] ||
          'Explorer';

        set({
          user: {
            id: u.id,
            email: u.email || '',
            fullName,
            avatarUrl: u.user_metadata?.avatar_url || null,
            isGuest: false,
          },
          session: data.session,
          isInitialized: true,
          isLoading: false,
        });
      } else if (isGuestCookie) {
        set({
          user: {
            id: 'guest-explorer',
            email: 'guest@atlas.journal',
            fullName: 'Guest Explorer',
            isGuest: true,
          },
          session: null,
          isInitialized: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          session: null,
          isInitialized: true,
          isLoading: false,
        });
      }

      // 2. Set up listener for auth state changes
      supabase.auth.onAuthStateChange((event: any, session: any) => {
        if (session?.user) {
          const u = session.user;
          const fullName =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email?.split('@')[0] ||
            'Explorer';

          set({
            user: {
              id: u.id,
              email: u.email || '',
              fullName,
              avatarUrl: u.user_metadata?.avatar_url || null,
              isGuest: false,
            },
            session,
            isInitialized: true,
            isLoading: false,
          });
        } else if (
          typeof document !== 'undefined' &&
          document.cookie.includes('atlas_guest_mode=true')
        ) {
          set({
            user: {
              id: 'guest-explorer',
              email: 'guest@atlas.journal',
              fullName: 'Guest Explorer',
              isGuest: true,
            },
            session: null,
            isInitialized: true,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            session: null,
            isInitialized: true,
            isLoading: false,
          });
        }
      });
    } catch (err) {
      console.warn('initAuth caught error:', err);
      set({ isInitialized: true, isLoading: false });
    }
  },
}));
