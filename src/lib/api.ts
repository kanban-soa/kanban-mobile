import ky from 'ky';

import { clearTokens, getAccessToken } from '~/features/auth/tokens';

const DEFAULT_BASE_URL = 'http://localhost:8080';

const baseUrl =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? DEFAULT_BASE_URL;

export const api = ky.create({
  prefixUrl: baseUrl,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getAccessToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          await clearTokens();
        }
        return response;
      },
    ],
  },
});
