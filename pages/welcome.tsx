import { Alert, Box, Typography } from '@mui/joy';

import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import { GetServerSideProps } from 'next';
import PropsBase from '@/types/PropsBase';
import React from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import { getTotalDataPoint } from '@/lib/datapoints';
import { getUserInfo } from '@/lib/auth';

export interface WelcomeProps extends PropsBase {
  openid: string;
}

export default function Welcome({ userinfo }: WelcomeProps) {
  const [buttonClicked, setButtonClicked] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [errorDetail, setErrorDetail] = React.useState('');
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
          disabled={buttonClicked || failed}
          onClick={() => {
            setButtonClicked(true);
            fetch(`/api/v1/user/${userinfo!.sub}/initialize`)
              .then((res) => {
                if (res.ok) {
                  window.location.href = '/my';
                } else {
                  setFailed(true);
                  setButtonClicked(false);
                  res.text().then((text) => {
                    setErrorDetail(text);
                  });
                }
              })
              .catch((err) => {
                setFailed(true);
                setErrorDetail(err.toString());
              });
          }}
        >
          {buttonClicked ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CircularProgress
                sx={{
                  mr: '10px',
                }}
              />
              创建中...
            </Box>
          ) : (
            <span>创建您的档案</span>
          )}
        </Button>
        <Alert
          variant="soft"
          color="danger"
          startDecorator={
            <WarningIcon
              fontSize="medium"
              sx={{
                mt: '2px',
                mx: '4px',
              }}
            />
          }
          sx={{
            alignItems: 'flex-start',
            display: failed ? 'flex' : 'none',
            my: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              // alignItems: 'center',
            }}
          >
            <Typography fontWeight="lg" color="danger" mt={0.25}>
              创建失败
            </Typography>

            <Typography fontSize="sm" color="danger" sx={{ opacity: 0.8 }}>
              创建档案时发生了错误。
              <br />
              错误详情：{errorDetail}
            </Typography>
          </Box>
        </Alert>
      </div>
    </ContainerPageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const userinfo = await getUserInfo(req, res);
  if (!userinfo) {
    return {
      redirect: {
        permanent: false,
        destination:
          '/api/v1/auth/login?redirect_uri=' +
          encodeURIComponent(process.env.ZEITHROLD_ENDPOINT! + '/welcome'),
      },
    };
  }
  const datapoint = await getTotalDataPoint(userinfo!.sub);
  if (datapoint) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
  return {
    props: {
      userinfo,
    },
  };
};
