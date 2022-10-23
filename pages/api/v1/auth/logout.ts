import type { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from '../../../../lib/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession(req, res);
  await session.destroy();
  // deleteCookie('_Z_ACCESS_TOKEN', { req, res });
  res.setHeader(
    'Set-Cookie',
    `_Z_ACCESS_TOKEN=""; Path=/; Domain=.${
      new URL(process.env.ZEITHROLD_ENDPOINT!).host
    };`,
  );
  res.redirect(process.env.ZEITHROLD_ENDPOINT!);
}

export const config = {
  api: {
    externalResolver: true,
  },
};
