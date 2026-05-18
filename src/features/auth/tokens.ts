import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'kan.bn.accessToken';
const REFRESH_TOKEN_KEY = 'kan.bn.refreshToken';

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string | null) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

