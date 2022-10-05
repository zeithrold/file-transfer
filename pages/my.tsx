import type { GetServerSideProps, NextPage } from 'next';

import DefaultPageLayout from '@/layouts/DefaultPageLayout';
import PropsBase from '@/types/PropsBase';
import { getUserInfo } from '@/lib/auth';

interface MyProps extends PropsBase {
  logoutUrl: string;
}

const My: NextPage<MyProps> = ({ userinfo, logoutUrl }) => {
  return (
    <DefaultPageLayout userinfo={userinfo}>
      <a href={logoutUrl}> Logout </a>
    </DefaultPageLayout>
  );
};

const getServerSideProps: GetServerSideProps<MyProps> = async ({
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
      },
    };
  }
  const logoutUrl = '/api/v1/auth/logout';
  const serverSideProps: any = { props: {} };
  serverSideProps.props.logoutUrl = logoutUrl;
  if (userinfo) {
    serverSideProps.props.userinfo = userinfo;
  }
  return serverSideProps;
};

export default My;

export { getServerSideProps };
