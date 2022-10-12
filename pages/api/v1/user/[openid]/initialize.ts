import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo, verifyAccessToken } from '@/lib/auth';

import { AppDataSource } from '@/lib/database';
import { Plan } from '@/lib/entity';
import { getTotalDataPoint } from '@/lib/datapoints';

// import { getSession } from '@/lib/session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // const session = await getSession(req, res);
  const error = await verifyAccessToken(req, res);
  if (error) {
    return;
  }
  const userinfo = await getUserInfo(req, res);
  if (userinfo!.sub !== (req.query.openid! as string)) {
    res.status(400).json({
      error: 'invalid_openid',
    });
    return;
  }
  const datapoints = await getTotalDataPoint(userinfo!.sub);
  if (datapoints) {
    res.status(400).json({
      error: 'already_initialized',
    });
    return;
  }
  const defaultPlan = new Plan();
  defaultPlan.openid = userinfo!.sub;
  defaultPlan.plan_id = 'default_v1';
  const expire_at = new Date();
  expire_at.setMonth(expire_at.getMonth() + 1);
  defaultPlan.expire_at = expire_at;
  const planRepository = await AppDataSource.getRepository(Plan);
  planRepository.save(defaultPlan);
  res.status(200).json({
    error: 'success',
  });
}
