import { Plan, PlanTemplate } from './entity';

import { AppDataSource } from './database';
import { MoreThan } from 'typeorm';

export interface PlanQueryResponse {
  plan_id: string;
  name: string;
  description: string;
  expires_at: string;
  datapoints: number;
}

export async function getPlans(
  openid: string,
): Promise<PlanQueryResponse[] | null> {
  const planRepository = await AppDataSource.getRepository(Plan);
  let errorOccured = false;
  const plans = await planRepository
    .findBy({ openid, expire_at: MoreThan(new Date()) })
    .catch(() => {
      errorOccured = true;
      // console.error(err);
    });

  if (errorOccured || !plans) {
    return null;
  }
  const planTemplateRepository = await AppDataSource.getRepository(
    PlanTemplate,
  );
  const planTemplates = await planTemplateRepository
    .find({
      where: plans.map((plan) => {
        return {
          plan_id: plan.plan_id!,
        };
      }),
    })
    .catch(() => {
      errorOccured = true;
      // console.error(err);
    });

  if (errorOccured || !planTemplates) {
    return null;
  }
  const result = planTemplates.map((planTemplate) => {
    const plan = plans.find((plan) => {
      return plan.plan_id === planTemplate.plan_id;
    });
    return {
      plan_id: planTemplate.plan_id!,
      name: planTemplate.name!,
      description: planTemplate.description!,
      expires_at: plan!.expire_at!.toLocaleDateString(),
      datapoints: planTemplate.datapoints!,
    };
  });

  return result;
}

export async function getDataPoint(param: PlanQueryResponse[] | string) {
  if (typeof param === 'string') {
    const plans = await getPlans(param);

    // console.log(plans);
    if (!plans) {
      return 0;
    }
    let sum = 0;
    plans.forEach((plan) => {
      sum += plan.datapoints;
    });
    return sum;
  } else {
    return param.reduce((sum, plan) => {
      return sum + plan.datapoints;
    }, 0);
  }
}
