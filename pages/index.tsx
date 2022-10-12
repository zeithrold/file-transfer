import { Card, Typography } from '@mui/joy';
import type { GetServerSideProps, NextPage } from 'next';
import { getTotalDataPoint, getUsedDataPoint } from '@/lib/datapoints';

import CodeInputBox from '@/components/CodeInputBox';
import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import PropsBase from '@/types/PropsBase';
import { getUserInfo } from '@/lib/auth';

interface HomeProps extends PropsBase {
  usedDataPoint?: number;
  totalDataPoint?: number;
}

const Home: NextPage<HomeProps> = ({
  userinfo,
  usedDataPoint,
  totalDataPoint,
}) => {
  return (
    <ContainerPageLayout
      userinfo={userinfo}
      sx={{
        py: 8,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography
          level="h2"
          sx={{
            mb: 1,
          }}
        >
          传输文件，一触即达。
        </Typography>
        <Typography>
          这里是文件中转站。您可以在这里轻松上传并取回文件。
        </Typography>
        <Typography>输入文件码并回车，或双击文本框以上传文件。</Typography>
        <CodeInputBox />
        {userinfo ? (
          <Typography level="body2">
            您的数据点: {usedDataPoint?.toFixed(2)} /{' '}
            {totalDataPoint?.toFixed(2)} DP
          </Typography>
        ) : null}
      </Card>
    </ContainerPageLayout>
  );
};

const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
  res,
}) => {
  const userinfo = await getUserInfo(req, res);
  if (!userinfo) {
    return {
      props: {},
    };
  }
  const [usedDataPoint, totalDataPoint] = await Promise.all([
    getUsedDataPoint(userinfo.sub),
    getTotalDataPoint(userinfo.sub),
  ]);
  return {
    props: {
      userinfo,
      usedDataPoint,
      totalDataPoint,
    },
  };
};

export default Home;

export { getServerSideProps };
