export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string | null;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export type AuthSession = {
  user: AuthUser | null;
  tokens: AuthTokens;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string | null;
  user?: AuthUser | null;
};

