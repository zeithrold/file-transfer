import { Button, Card, Sheet, Typography } from '@mui/joy';
import { FileQueryResponse, getFileList } from '@/lib/file';
import type { GetServerSideProps, NextPage } from 'next';
import {
  PlanQueryResponse,
  getPlans,
  getTotalDataPoint,
  getUsedDataPoint,
} from '@/lib/datapoints';

import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import PropsBase from '@/types/PropsBase';
import { getUserInfo } from '@/lib/auth';
// import styles from '@/styles/pages/my.module.scss';
import tableStyles from '@/styles/components/Table.module.scss';

interface MyPageProps extends PropsBase {
  usedDataPoint?: number;
  totalDataPoint?: number;
  plans?: PlanQueryResponse[];
  files?: FileQueryResponse[];
}

const MyPage: NextPage<MyPageProps> = ({
  userinfo,
  totalDataPoint,
  usedDataPoint,
  plans,
  files,
}) => {
  return (
    <ContainerPageLayout
      userinfo={userinfo}
      sx={{
        pb: 4,
      }}
    >
      <div>
        <h1>欢迎，{userinfo!.preferred_username!}！</h1>
        <div>
          <Card
            variant="outlined"
            sx={{
              maxWidth: '640px',
              mb: 2,
            }}
          >
            <div>
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
            </div>

            <div>
              <Typography level="h2" fontSize="lg" sx={{ mb: 2 }}>
                已上传的文件信息
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
                      <th className={tableStyles.tableCell}>文件名</th>
                      <th className={tableStyles.tableCell}>文件码</th>
                      <th className={tableStyles.tableCell}>文件大小</th>
                      <th className={tableStyles.tableCell}>上传时间</th>
                      <th className={tableStyles.tableCell}>到期时间</th>
                      <th className={tableStyles.tableCell}>存储时长</th>

                      <th className={tableStyles.tableCell}>消耗的数据点</th>
                    </tr>
                  </thead>
                  <tbody className={tableStyles.tableBody}>
                    {files!.map((row) => (
                      <tr key={row.code!} className={tableStyles.tableRow}>
                        <td className={tableStyles.tableCell}>
                          <b>{row.name}</b>
                        </td>
                        <td className={tableStyles.tableCell}>{row.code}</td>
                        <td className={tableStyles.tableCell}>
                          {row.size_megabytes > 1024
                            ? `${(row.size_megabytes / 1024).toFixed(2)} GB`
                            : `${row.size_megabytes.toFixed(2)} MB`}
                        </td>
                        <td className={tableStyles.tableCell}>
                          {row.uploaded_at}
                        </td>

                        <td className={tableStyles.tableCell}>
                          {row.expires_at}
                        </td>

                        <td className={tableStyles.tableCell}>
                          {row.storage_duration_seconds >= 60 * 60 * 24
                            ? `${
                                row.storage_duration_seconds / 60 / 60 / 24
                              } 天`
                            : `${row.storage_duration_seconds / 60 / 60} 小时`}
                        </td>
                        <td className={tableStyles.tableCell}>
                          {`${row.dataPoint.toFixed(2)} DP`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Sheet>
            </div>
            <div>
              <Typography level="body3">数据点总和</Typography>
              <Typography fontSize="lg" fontWeight="lg">
                {usedDataPoint!.toFixed(2)} / {totalDataPoint!.toFixed(2)} DP
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
  const [usedDataPoint, totalDataPoint, files] = await Promise.all([
    getUsedDataPoint(userinfo.sub),
    getTotalDataPoint(plans),
    getFileList(userinfo.sub),
  ]);
  return {
    props: {
      userinfo,
      totalDataPoint,
      usedDataPoint,
      plans,
      files,
    },
  };
};

export default MyPage;

export { getServerSideProps };
