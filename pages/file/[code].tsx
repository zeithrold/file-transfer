import { Alert, Button, Card, CircularProgress, Typography } from '@mui/joy';
import { FileIcon, IconType } from 'react-file-icon';
import {
  checkFileExists,
  getFile,
  getFileType,
  getFileTypeColor,
} from '@/lib/file';

import Box from '@mui/joy/Box';
import { CloudDownload } from '@mui/icons-material';
import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import { File as DbFile } from '@/lib/entity';
import { GetServerSideProps } from 'next';
import { PropsBase } from '@/types';
import React from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import { getUserInfo } from '@/lib/auth';

export interface FileDownloadProps extends PropsBase {
  fileExists: boolean;
  name?: string;
  size?: string;
  type?: string;
  type_color?: string;
  file_id?: string;
  extension?: string;
}

export default function FileDownload({
  userinfo,
  fileExists,
  name,
  size,
  type,
  type_color,
  file_id,
  extension,
}: FileDownloadProps) {
  const [failed, setFailed] = React.useState(false);
  const [buttonClicked, setButtonClicked] = React.useState(false);
  return (
    <ContainerPageLayout
      userinfo={userinfo}
      sx={{
        py: 4,
      }}
    >
      {fileExists ? (
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
          <Typography
            level="h2"
            sx={{
              mb: 1,
            }}
          >
            {name}
          </Typography>
          <Typography level="body2">{size}</Typography>
          <Button
            onClick={() => {
              setButtonClicked(true);
              fetch(`/api/v1/file/${file_id}`)
                .then((res) => {
                  return res.json();
                })
                .then((data) => {
                  if (data.url) {
                    window.open(data.url);
                    window.location.href = '/';
                  }
                })
                .catch(() => {
                  setFailed(true);
                })
                .finally(() => {
                  setButtonClicked(false);
                });
            }}
            color="neutral"
            sx={{
              my: 1,
            }}
            size="lg"
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
                  color="neutral"
                />
                创建中...
              </Box>
            ) : (
              <>
                <CloudDownload
                  fontSize="medium"
                  sx={{
                    mr: 1,
                  }}
                />
                点击下载
              </>
            )}
          </Button>
          <Typography level="body2">
            <b>请您注意！</b>一经下载文件码即刻失效，同时释放数据点。
          </Typography>
        </Card>
      ) : (
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
              找不到您想要的文件
            </Typography>

            <Typography fontSize="sm" color="danger" sx={{ opacity: 0.8 }}>
              请检查您的文件码是否正确。
            </Typography>
          </Box>
        </Alert>
      )}

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
          }}
        >
          <Typography fontWeight="lg" color="danger" mt={0.25}>
            出现错误
          </Typography>

          <Typography fontSize="sm" color="danger" sx={{ opacity: 0.8 }}>
            获取文件信息失败，请联系管理员。
          </Typography>
        </Box>
      </Alert>
    </ContainerPageLayout>
  );
}

export const getServerSideProps: GetServerSideProps<
  FileDownloadProps
> = async ({ req, res, query }) => {
  const { code } = query;
  const [userinfo, fileExists] = await Promise.all([
    getUserInfo(req, res),
    checkFileExists(code as string),
  ]);
  if (!fileExists) {
    return {
      props: {
        userinfo,
        fileExists,
      },
    };
  }
  const file = (await getFile(code as string)) as DbFile;
  const { name } = file;
  // get extension of file, then get type and color
  // if no extension, then set type to "unknown"
  const extension = name!.split('.').length > 1 ? name!.split('.').pop() : '';
  const type = getFileType(extension!);
  const type_color = getFileTypeColor(type);

  return {
    props: {
      extension,
      userinfo,
      fileExists,
      name: file.name,
      size:
        file.size_megabytes! > 1024
          ? `${(file.size_megabytes! / 1024).toFixed(2)} GB`
          : `${file.size_megabytes!.toFixed(2)} MB`,
      file_id: file.file_id,
      type,
      type_color,
    },
  };
};
