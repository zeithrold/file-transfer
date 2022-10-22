import { Box, Card, Typography } from '@mui/joy';
import { FileIcon, IconType } from 'react-file-icon';
import { getFileType, getFileTypeColor } from '@/lib/file';

import { AppDataSource } from '@/lib/database';
import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import { File as DbFile } from '@/lib/entity';
import { GetServerSideProps } from 'next';
import { PropsBase } from '@/types';
import { getUserInfo } from '@/lib/auth';

export interface SuccessPageProps extends PropsBase {
  name?: string;
  code?: string;

  type?: string;
  type_color?: string;
  extension?: string;
}

export default function SuccessPage({
  userinfo,
  name,
  code,
  type,
  type_color,
  extension,
}: SuccessPageProps) {
  return (
    <ContainerPageLayout userinfo={userinfo}>
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: '50px',
            height: '50px',
            pb: 4,
          }}
        >
          <FileIcon
            type={type as IconType}
            color={type_color}
            extension={extension}
          />
        </Box>
        <Typography level="h4">{name}</Typography>
        <Typography
          level="body2"
          sx={{
            my: 1,
          }}
        >
          您上传的文件的文件码：
        </Typography>
        <Box
          sx={{
            width: '90%',
            justifyContent: 'center',
            mx: '12px',
            fontSize: '1.5em',
            padding: '10px',
            textAlign: 'center',
            fontWeight: 'bold',
            borderRadius: '8px',
            borderColor: 'black',
            borderWidth: '3px',
            borderStyle: 'solid',
            maxWidth: '320px',
          }}
        >
          <Typography level="h2">{code}</Typography>
        </Box>
      </Card>
    </ContainerPageLayout>
  );
}

const getServerSideProps: GetServerSideProps<SuccessPageProps> = async ({
  req,
  res,
  query,
}) => {
  const userinfo = await getUserInfo(req, res);
  if (!userinfo) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  const id = query.id as string;
  const fileRepository = await AppDataSource.getRepository(DbFile);
  const file = await fileRepository.findOneBy({
    file_id: id,
  });
  if (!file) {
    return {
      notFound: true,
    };
  }
  if (file.status !== 'uploaded') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  file.status = 'active';
  file.expires_at = new Date(
    file.uploaded_at!.getTime() + 1000 * file.storage_duration_seconds!,
  );
  fileRepository.save(file);
  const extension = file.name!.split('.').pop();
  const type = getFileType(extension!);
  const type_color = getFileTypeColor(type);

  return {
    props: {
      name: file.name,
      code: file.code,
      type,
      type_color,
      extension,
      userinfo: userinfo,
    },
  };
};

export { getServerSideProps };
