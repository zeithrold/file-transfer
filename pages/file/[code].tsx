import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import { GetServerSideProps } from 'next';
import { PropsBase } from '@/types';
import { getUserInfo } from '@/lib/auth';

export interface FileDownloadProps extends PropsBase {}
export default function FileDownload({ userinfo }: FileDownloadProps) {
  return (
    <ContainerPageLayout userinfo={userinfo}>hello, world</ContainerPageLayout>
  );
}

export const getServerSideProps: GetServerSideProps<
  FileDownloadProps
> = async ({ req, res }) => {
  const userinfo = await getUserInfo(req, res);
  if (!userinfo) {
    return {
      props: {},
    };
  }
  return {
    props: {
      userinfo,
    },
  };
};
