import { Button, Card, Sheet, Typography } from '@mui/joy';
import type { GetServerSideProps, NextPage } from 'next';
import { PlanQueryResponse, getDataPoint, getPlans } from '@/lib/datapoints';

import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import PropsBase from '@/types/PropsBase';
import { getUserInfo } from '@/lib/auth';
// import styles from '@/styles/pages/my.module.scss';
import tableStyles from '@/styles/components/Table.module.scss';

interface MyPageProps extends PropsBase {
  datapoints?: number;
  plans?: PlanQueryResponse[];
}

const MyPage: NextPage<MyPageProps> = ({ userinfo, datapoints, plans }) => {
  return (
    <ContainerPageLayout userinfo={userinfo}>
      <div>
        <h1>欢迎，{userinfo!.preferred_username!}！</h1>
        <div>
          <Card
            variant="outlined"
            sx={{
              maxWidth: '640px',
            }}
          >
            <Typography level="h2" fontSize="lg" sx={{ mb: 2 }}>
              我的数据点信息
            </Typography>
            <Sheet
              variant="outlined"
              className={tableStyles.tableContainer}
              sx={{
                borderRadius: '8px',
                mb: 1.5,
              }}
            >
              <table className={tableStyles.table}>
                <thead className={tableStyles.tableHead}>
                  <tr className={tableStyles.tableRow}>
                    <th className={tableStyles.tableCell}>计划名</th>
                    <th className={tableStyles.tableCell}>计划说明</th>
                    <th className={tableStyles.tableCell}>数据点</th>
                    <th className={tableStyles.tableCell}>到期时间</th>
                  </tr>
                </thead>
                <tbody className={tableStyles.tableBody}>
                  {plans!.map((row) => (
                    <tr key={row.plan_id!} className={tableStyles.tableRow}>
                      <td className={tableStyles.tableCell}>
                        <b>{row.name}</b>
                      </td>
                      <td className={tableStyles.tableCell}>
                        {row.description}
                      </td>
                      <td className={tableStyles.tableCell}>
                        {row.datapoints}
                      </td>
                      <td className={tableStyles.tableCell}>
                        {row.expires_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Sheet>
            <div>
              <Typography level="body3">数据点总和</Typography>
              <Typography fontSize="lg" fontWeight="lg">
                {datapoints!.toFixed(2)}
              </Typography>
            </div>
          </Card>
        </div>
        <div>
          <h2>用户设置</h2>
          <div>
            <h3>账户操作</h3>
            <Button
              size="lg"
              color="danger"
              onClick={() => {
                window.location.href = '/api/v1/auth/logout';
              }}
            >
              <b>退出账户</b>
            </Button>
          </div>
        </div>
      </div>
    </ContainerPageLayout>
  );
};

const getServerSideProps: GetServerSideProps<MyPageProps> = async ({
  req,
  res,
}) => {
  const userinfo = await getUserInfo(req, res);
  if (!userinfo) {
    return {
      redirect: {
        destination:
          '/api/v1/auth/login?redirect_uri=' +
          encodeURIComponent(process.env.ZEITHROLD_ENDPOINT! + '/my'),

        permanent: false,
      },
    };
  }
  const plans = await getPlans(userinfo.sub);
  if (!plans) {
    return {
      redirect: {
        destination: '/welcome',
        permanent: false,
      },
    };
  }
  const datapoints = await getDataPoint(plans);
  return {
    props: {
      userinfo,
      datapoints,
      plans,
    },
  };
};

export default MyPage;

export { getServerSideProps };
