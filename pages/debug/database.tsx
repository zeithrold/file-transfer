import { AppDataSource } from '@/lib/database';
import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import { GetServerSideProps } from 'next';
import { Plan } from '@/lib/entity/Plan';
import PropsBase from '@/types/PropsBase';
import React from 'react';
import Sheet from '@mui/joy/Sheet';
import { getUserInfo } from '@/lib/auth';
import tableStyles from '@/styles/components/Table.module.scss';

interface DataBaseData {
  key: string;
  value: string;
}

function createData({ key, value }: DataBaseData) {
  return { key, value };
}

export interface DatabasePageProps extends PropsBase {
  userInfoData: DataBaseData[];
}

export default function Datasase({
  userinfo,
  userInfoData,
}: DatabasePageProps) {
  return (
    <ContainerPageLayout userinfo={userinfo}>
      <h1>调试页面</h1>
      <div>
        <h2>用户基本信息</h2>
        <Sheet variant="outlined" className={tableStyles.tableContainer}>
          <table className={tableStyles.table}>
            <thead className={tableStyles.tableHead}>
              <tr className={tableStyles.tableRow}>
                <th className={tableStyles.tableCell}>key</th>
                <th className={tableStyles.tableCell}>value</th>
              </tr>
            </thead>
            <tbody className={tableStyles.tableBody}>
              {userInfoData.map((row) => (
                <tr key={row.key} className={tableStyles.tableRow}>
                  <td className={tableStyles.tableCell}>{row.key}</td>
                  <td className={tableStyles.tableCell}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>
      </div>
    </ContainerPageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const userinfo = await getUserInfo(req, res);
  if (!userinfo) {
    return {
      redirect: {
        destination:
          '/api/v1/auth/login?redirect_uri=' +
          encodeURIComponent(process.env.ZEITHROLD_ENDPOINT! + '/welcome'),
      },
    };
  }

  const serverSideProps: any = { props: {} };
  const userInfoData: DataBaseData[] = [
    createData({ key: 'username', value: userinfo.preferred_username! }),
    createData({ key: 'email', value: userinfo.email! }),
    createData({ key: 'avatar', value: userinfo.picture! }),
    createData({ key: 'openid', value: userinfo.sub! }),
  ];
  serverSideProps.props.userInfoData = userInfoData;
  const planRepository = AppDataSource.getRepository(Plan);
  const plan = new Plan();
  plan.openid = userinfo.sub;
  let userPlans: Plan[] | undefined;
  // test
  const newPlan = new Plan();
  newPlan.openid = userinfo.sub;
  newPlan.plan_id = 'test';
  newPlan.expire_at = new Date();
  await planRepository.save(newPlan);
  try {
    userPlans = await planRepository.findBy({
      openid: userinfo.sub,
    });
  } catch (e) {
    console.log(e);
    userPlans = undefined;
  }
  const logoutUrl = '/api/v1/auth/logout';
  serverSideProps.props.logoutUrl = logoutUrl;
  if (userinfo) {
    serverSideProps.props.userinfo = userinfo;
  }
  return serverSideProps;
};
