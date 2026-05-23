import { HTTPError } from 'ky';

import { api } from '~/lib/api';
import { AUTH } from '~/lib/api/routes';
import type {
  Account,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '~/lib/api/types';

import { clearTokens, setTokens } from './tokens';

async function persist(response: AuthResponse) {
  await setTokens(response.token, response.refreshToken ?? null);
  return response;
}

async function unwrapHttpError(error: unknown): Promise<never> {
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.clone().json()) as { error?: string; message?: string };
      const reason = body.error ?? body.message;
      if (reason) {
        throw new Error(reason);
      }
    } catch (parseError) {
      if (parseError instanceof Error && parseError !== error) {
        throw parseError;
      }
    }
  }
  throw error;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  try {
    const data = await api.post(AUTH.LOGIN, { json: payload }).json<AuthResponse>();
    return await persist(data);
  } catch (error) {
    await unwrapHttpError(error);
  }
  throw new Error('Unreachable');
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  try {
    const data = await api.post(AUTH.REGISTER, { json: payload }).json<AuthResponse>();
    return await persist(data);
  } catch (error) {
    await unwrapHttpError(error);
  }
  throw new Error('Unreachable');
}

export async function logout(): Promise<void> {
  await clearTokens();
}

export async function listAccounts(): Promise<Account[]> {
  const data = await api
    .get(AUTH.LIST_ACCOUNTS)
    .json<Account[] | { data: Account[] }>();
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function updateUser(
  id: string,
  updates: Partial<Account>,
): Promise<Account> {
  return api.put(AUTH.UPDATE_USER(id), { json: updates }).json<Account>();
}

export async function getUser(id: string): Promise<Account> {
  return api.get(AUTH.GET_USER(id)).json<Account>();
}

// ── Legacy aliases used by the auth store ────────────────────────────────────
export const signIn = login;
export const signUp = register;
