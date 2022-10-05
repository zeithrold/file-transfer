import type { GetServerSideProps, NextPage } from 'next';

import DefaultPageLayout from '@/layouts/DefaultPageLayout';
import PropsBase from '@/types/PropsBase';
import { getUserInfo } from '@/lib/auth';

interface HomeProps extends PropsBase {}

const Home: NextPage<HomeProps> = ({ userinfo }) => {
  return (
    <DefaultPageLayout userinfo={userinfo}>
      <div>hello, world!</div>
    </DefaultPageLayout>
  );
};

const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
  res,
}) => {
  const userinfo = await getUserInfo(req, res);
  const serverSideProps: any = { props: {} };
  if (userinfo) {
    serverSideProps.props.userinfo = userinfo;
  }
  return serverSideProps;
};

export default Home;

export { getServerSideProps };
