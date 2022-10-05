import type { GetServerSideProps, NextPage } from 'next';

import Head from 'next/head';
import Image from 'next/image';
import { getSession } from '@/lib/session';
import { oidcClient } from '@/lib/auth';

interface HomeProps {
  login?: boolean;
  test?: string;
  access_token?: string;
  username?: string;
}

const Home: NextPage<HomeProps> = (props) => {
  return (
    <div>
      <div>hello, world!, {props.test}</div>
      <div>{props.login ? 'true' : 'false'}</div>
      <a
        href={`${
          process.env.ZEITHROLD_ENDPOINT
        }/api/v1/auth/login?redirect_uri=${encodeURIComponent(
          process.env.ZEITHROLD_ENDPOINT!,
        )}`}
      >
        Login
      </a>
    </div>
  );
};

const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  req,
  res,
}) => {
  const session = await getSession(req, res);
  const login = session.login ? true : false;
  let username: string;
  if (login) {
    if (!session.access_token) {
      return {
        redirect: {
          destination: '/api/v1/auth/login?' + encodeURIComponent(req.url!),
        },
        props: {},
      };
    }
  }
  return {
    props: {
      login,
      test: 'test',
    },
  };
};

export default Home;

export { getServerSideProps };
