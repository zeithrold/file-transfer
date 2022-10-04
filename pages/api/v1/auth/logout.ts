import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "../../../../lib/session"
import cookies from 'cookies-next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res)
  await session.destroy()
  cookies.deleteCookie('_Z_ACCESS_TOKEN', { req, res })
  res.redirect(process.env.ZEITHROLD_ENDPOINT!)
}

export const config = {
  api: {
    externalResolver: true
  }
}
