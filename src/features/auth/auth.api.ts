import { api } from '~/lib/api';
import type { AuthResponse, LoginPayload, SignupPayload } from '~/types';

export async function signIn(payload: LoginPayload) {
  return api.post('auth/login', { json: payload }).json<AuthResponse>();
}

export async function signUp(payload: SignupPayload) {
  return api.post('auth/signup', { json: payload }).json<AuthResponse>();
}

