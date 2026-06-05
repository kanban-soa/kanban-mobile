import { create } from 'zustand';

import { login as loginRequest, register as registerRequest } from '~/features/auth/auth.api';
import { clearTokens } from '~/features/auth/tokens';
import type { AuthSession, AuthStatus, AuthUser, LoginPayload, SignupPayload } from '~/types';

type AuthState = {
  session: AuthSession | null;
  status: AuthStatus;
  error: string | null;
  hydrate: () => Promise<void>;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: SignupPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  status: 'unauthenticated',
  error: null,
  hydrate: async () => {
    // In a real app, you'd try to load tokens from storage here.
    set({ status: 'unauthenticated', session: null });
  },
  signIn: async (payload) => {
    set({ status: 'loading', error: null });
    try {
      const response = await loginRequest(payload);
      if (!response.token) {
        throw new Error('Missing access token in response.');
      }
      set({
        status: 'authenticated',
        session: {
          user: response.user as AuthUser,
          tokens: { accessToken: response.token, refreshToken: response.refreshToken ?? null },
        },
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unable to sign in.',
      });
    }
  },
  signUp: async (payload) => {
    set({ status: 'loading', error: null });
    try {
      const response = await registerRequest(payload);
      if (!response.token) {
        throw new Error('Missing access token in response.');
      }
      set({
        status: 'authenticated',
        session: {
          user: response.user as AuthUser,
          tokens: { accessToken: response.token, refreshToken: response.refreshToken ?? null },
        },
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unable to create account.',
      });
    }
  },
  signOut: async () => {
    await clearTokens();
    set({ session: null, status: 'unauthenticated', error: null });
  },
}));
