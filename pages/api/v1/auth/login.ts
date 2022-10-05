import type { NextApiRequest, NextApiResponse } from 'next';
import { isInitialized, oidcClient } from '@/lib/auth';

import { ZEITHROLD_HOST } from '@/lib/constants';
import cookies from 'cookies-next';
import { generators } from 'openid-client';
import { getSession } from '@/lib/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!isInitialized) {
    res.status(500).json({
      error: 'oidc_not_initialized',
    });
    return;
  }
  const session = await getSession(req, res);
  // check if redirect_uri param exist
  if (!req.query.redirect_uri) {
    res.status(400).json({
      error: 'no_redirect_uri',
    });
    return;
  }
  const { redirect_uri } = req.query;
  // check if redirect_uri is just a single string
  if (typeof redirect_uri !== 'string') {
    res.status(400).json({
      error: 'multiple_redirect_uri',
    });
    return;
  }
  // if session.login is set to true, just verify the access_token valid.
  if (session.login) {
    const { access_token } = session;
    oidcClient
      .introspect(access_token)
      .then((value) => {
        res.redirect(redirect_uri);
        cookies.setCookie('_Z_ACCESS_TOKEN', access_token, {
          req,
          res,
          domain: ZEITHROLD_HOST,
          path: '/',
          expires: new Date(value.exp!),
        });
        return;
      })
      .catch((reason) => {
        session.login = false;
      });
  }
  // here add redirect_uri to session
  session.redirect_uri = redirect_uri;
  const code_verifier = generators.codeVerifier();
  const code_challenge = generators.codeChallenge(code_verifier);
  session.code_verifier = code_verifier;
  const authZUrl = oidcClient.authorizationUrl({
    scope: 'openid email profile',
    code_challenge,
    code_challenge_method: 'S256',
  });
  res.redirect(authZUrl);
}

export const config = {
  api: {
    externalResolver: true,
  },
};
