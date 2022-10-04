import type { NextApiRequest, NextApiResponse } from "next";
import { isInitialized, oidcClient } from "../../../../lib/auth";
import { getSession } from "../../../../lib/session";
import cookies from 'cookies-next'
import { ZEITHROLD_HOST } from "../../../../lib/constants";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!isInitialized) {
    res.status(500)
      .json({
        error: 'oidc_not_initialized'
      })
    return
  }
  // check query first
  if (!req.query.code) {
    res.status(400)
      .json({
        error: 'no_code'
      })
    return
  }
  const session = await getSession(req, res)
  if (!session.code_verifier) {
    res.status(400)
      .json({
        error: 'no_code_verifier'
      })
  }
  if (!session.redirect_uri) {
    res.status(400)
      .json({
        error: 'no_redirect_uri'
      })
  }
  const { code_verifier } = session;
  const params = oidcClient.callbackParams(req)
  const tokenSet = await oidcClient.callback(process.env.ZEITHROLD_ENDPOINT! + '/api/v1/auth/callback', params, { code_verifier })
    .catch((reason) => {
      res.status(400)
        .json({
          error: 'failed_to_authorize',
          reason
        })
    })
  const { access_token } = tokenSet!
  session.access_token = access_token!
  cookies.setCookie('_Z_ACCESS_TOKEN', access_token!, {
    req,
    res,
    domain: ZEITHROLD_HOST,
    path: '/',
    expires: new Date(tokenSet!.expires_at!)
  })
  session.login = true
  res.redirect(session.redirect_uri)
}

export const config = {
  api: {
    externalResolver: true
  }
}
