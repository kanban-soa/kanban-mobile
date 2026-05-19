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

const storage = Platform.OS === 'web' || !canUseSecureStore ? webStorage : SecureStore;

export async function getAccessToken() {
  return storage.getItemAsync ? storage.getItemAsync(ACCESS_TOKEN_KEY) : storage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return storage.getItemAsync ? storage.getItemAsync(REFRESH_TOKEN_KEY) : storage.getItem(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string | null) {
  if (storage.setItemAsync) {
    await storage.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await storage.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await storage.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
    return;
  }

  await storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    await storage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export async function clearTokens() {
  if (storage.deleteItemAsync) {
    await storage.deleteItemAsync(ACCESS_TOKEN_KEY);
    await storage.deleteItemAsync(REFRESH_TOKEN_KEY);
    return;
  }

  await storage.removeItem(ACCESS_TOKEN_KEY);
  await storage.removeItem(REFRESH_TOKEN_KEY);
}
