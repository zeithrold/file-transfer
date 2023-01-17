import type { NextApiRequest, NextApiResponse } from 'next';

import { TokenSet } from 'openid-client';
import { ZEITHROLD_HOST } from '@/lib/constants';
import { getSession } from '@/lib/session';
import { getTotalDataPoint } from '@/lib/datapoints';
import { oidcClient } from '@/lib/auth';
import { setCookie } from 'cookies-next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // check query first
  if (!req.query.code) {
    res.status(400).json({
      error: 'no_code',
    });
    return;
  }
  const session = await getSession(req, res);
  if (!session.code_verifier) {
    res.status(400).json({
      error: 'no_code_verifier',
    });
    return;
  }
  if (!session.redirect_uri) {
    res.status(400).json({
      error: 'no_redirect_uri',
    });
    return;
  }
  if (!session.state) {
    res.status(400).json({
      error: 'no_state',
    });
    return;
  }
  const { code_verifier, state } = session;
  const params = oidcClient.callbackParams(req);
  let tokenSet: TokenSet;
  try {
    tokenSet = await oidcClient.callback(
      process.env.ZEITHROLD_ENDPOINT! + '/api/v1/auth/callback',
      params,
      { code_verifier, scope: 'openid profile email', state },
    );
  } catch (e) {
    console.log(e);
    res.status(400).json({
      error: 'failed_to_authorize',
      reason: e,
    });
    return;
  }
  const { access_token } = tokenSet!;
  session.access_token = access_token!;
  setCookie('_Z_ACCESS_TOKEN', access_token!, {
    req,
    res,
    domain: ZEITHROLD_HOST,
    path: '/',
    httpOnly: true,
    expires: new Date(tokenSet!.expires_at! * 1000),
  });
  const userinfo = await oidcClient.userinfo(tokenSet);
  const dataPoints = await getTotalDataPoint(userinfo.sub);
  if (!dataPoints) {
    res.redirect('/welcome');
    return;
  }
  res.redirect(session.redirect_uri);
  return;
}

export const config = {
  api: {
    externalResolver: true,
  },
};
