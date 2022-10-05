import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import { GetServerSideProps } from 'next';
import PropsBase from '@/types/PropsBase';
import React from 'react';
import { getUserInfo } from '@/lib/auth';
import styles from '@/styles/pages/welcome.module.scss';

export interface WelcomeProps extends PropsBase {}

export default function Welcome({ userinfo }: WelcomeProps) {
  const [buttonClicked, setButtonClicked] = React.useState(false);
  return (
    <ContainerPageLayout userinfo={userinfo}>
      <div>
        <h1>欢迎来到文件中转站，{userinfo?.preferred_username}！</h1>
        <p>
          看起来这是你第一次访问文件中转站，点击下方按钮即可在本网站创建你的档案。
        </p>
        <p>创建档案后，您即可享受文件中转站的完整体验。</p>
        <Button
          size="lg"
          variant={buttonClicked ? 'soft' : 'solid'}
          disabled={buttonClicked}
          onClick={() => setButtonClicked(true)}
        >
          {buttonClicked ? (
            <span className={styles.initializeButtonContent}>
              <CircularProgress
                className={styles.initializeButtonProgressCircle}
              />
              创建中...
            </span>
          ) : (
            <span>创建您的档案</span>
          )}
        </Button>
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
  const logoutUrl = '/api/v1/auth/logout';
  const serverSideProps: any = { props: {} };
  serverSideProps.props.logoutUrl = logoutUrl;
  if (userinfo) {
    serverSideProps.props.userinfo = userinfo;
  }
  return serverSideProps;
};
