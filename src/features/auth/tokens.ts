import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'kan.bn.accessToken';
const REFRESH_TOKEN_KEY = 'kan.bn.refreshToken';

const canUseSecureStore =
  typeof SecureStore.getItemAsync === 'function' && typeof SecureStore.setItemAsync === 'function';

const webStorage = {
  getItem: async (key: string) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(key);
  },
};

export async function getAccessToken() {
  if (Platform.OS !== 'web' && canUseSecureStore) {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }
  return webStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  if (Platform.OS !== 'web' && canUseSecureStore) {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }
  return webStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string | null) {
  if (Platform.OS !== 'web' && canUseSecureStore) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
    return;
  }

  await webStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await webStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    await webStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export async function clearTokens() {
  if (Platform.OS !== 'web' && canUseSecureStore) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    return;
  }

  await webStorage.removeItem(ACCESS_TOKEN_KEY);
  await webStorage.removeItem(REFRESH_TOKEN_KEY);
}
