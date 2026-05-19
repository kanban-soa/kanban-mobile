import { create } from 'zustand';

import { signIn, signUp } from '~/features/auth/auth.api';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '~/features/auth/tokens';
import type { AuthSession, AuthStatus, LoginPayload, SignupPayload } from '~/types';

const emptySession: AuthSession = {
  user: null,
  tokens: {
    accessToken: '',
    refreshToken: null,
  },
};

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
  status: 'idle',
  error: null,
  hydrate: async () => {
    set({ status: 'loading', error: null });
    const accessToken = await getAccessToken();
    if (!accessToken) {
      set({ status: 'unauthenticated', session: null });
      return;
    }
    const refreshToken = await getRefreshToken();
    set({
      status: 'authenticated',
      session: {
        ...emptySession,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  },
  signIn: async (payload) => {
    set({ status: 'loading', error: null });
    try {
      const response = await signIn(payload);
      const accessToken = response.accessToken ?? '';
      const refreshToken = response.refreshToken ?? null;
      if (!accessToken) {
        throw new Error('Missing access token in response.');
      }
      await setTokens(accessToken, refreshToken);
      set({
        status: 'authenticated',
        session: {
          user: response.user ?? null,
          tokens: { accessToken, refreshToken },
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
      const response = await signUp(payload);
      const accessToken = response.accessToken ?? '';
      const refreshToken = response.refreshToken ?? null;
      if (!accessToken) {
        throw new Error('Missing access token in response.');
      }
      await setTokens(accessToken, refreshToken);
      set({
        status: 'authenticated',
        session: {
          user: response.user ?? null,
          tokens: { accessToken, refreshToken },
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

