import { Issuer, UnknownObject, UserinfoResponse } from 'openid-client';
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest, NextResponse } from '@/types';

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

export const getUserInfo = async (req: NextRequest, res: NextResponse) => {
  const session = await getSession(req, res);
  let access_token: string | undefined;
  if (session.access_token) {
    access_token = session.access_token;
  } else if (getCookie('_Z_ACCESS_TOKEN', { req, res })) {
    access_token = getCookie('_Z_ACCESS_TOKEN', { req, res }) as string;
    session.access_token = access_token;
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

export const verifyAccessToken = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<boolean> => {
  let error = false;
  const session = await getSession(req, res);
  if (!session.access_token) {
    res.status(400).json({
      error: 'no_access_token',
    });
    error = true;
    return error;
  }
  let userinfo: UserinfoResponse<UnknownObject, UnknownObject> | undefined =
    await getUserInfo(req, res);
  if (!userinfo) {
    res.status(400).json({
      error: 'invalid_access_token',
    });
    error = true;
    return error;
  }
  return error;
};
