import { IncomingMessage, ServerResponse } from 'http';

import { Issuer } from 'openid-client';
import { getCookie } from 'cookies-next';
import { getSession } from './session';
import { logWithDate } from './logging';

export const oidcIssuer = await Issuer.discover(
  process.env.ZEITHROLD_OIDC_ISSUER!,
);

export const oidcClient = new oidcIssuer.Client({
  client_id: process.env.ZEITHROLD_OIDC_CLIENT_ID!,
  client_secret: process.env.ZEITHROLD_OIDC_CLIENT_SECERT!,
  redirect_uris: [process.env.ZEITHROLD_ENDPOINT! + '/api/v1/auth/callback'],
  response_types: ['code'],
});

export const getUserInfo = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const session = await getSession(req, res);
  let access_token: string | undefined;
  if (session.access_token) {
    access_token = session.access_token;
  } else if (getCookie('_Z_ACCESS_TOKEN', { req, res })) {
    access_token = getCookie('_Z_ACCESS_TOKEN', { req, res }) as string;
  }
  if (access_token) {
    try {
      const userinfo = await oidcClient.userinfo(access_token);
      return userinfo;
    } catch (e) {
      logWithDate(e);
    }
  }
  return undefined;
};
