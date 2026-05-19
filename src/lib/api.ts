import ky from 'ky';

import { getAccessToken } from '~/features/auth/tokens';

export const api = ky.create({
  prefixUrl: 'https://kan.bn/api/v1',
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await getAccessToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
});

