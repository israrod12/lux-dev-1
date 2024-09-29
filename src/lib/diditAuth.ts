import { cache } from 'react';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

let cachedToken: TokenResponse | null = null;
let tokenExpirationTime: number | null = null;

export const getAuthToken = cache(async (): Promise<string> => {
  if (cachedToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return cachedToken.access_token;
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/v2/token/`;
  const clientID = process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const encodedCredentials = Buffer.from(
    `${clientID}:${clientSecret}`,
  ).toString('base64');
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }

    const data: TokenResponse = await response.json();
    cachedToken = data;
    tokenExpirationTime = Date.now() + (data.expires_in * 1000) - 60000; // Expire 1 minute early

    return data.access_token;
  } catch (error) {
    console.error('Error fetching auth token:', error);
    throw error;
  }
});