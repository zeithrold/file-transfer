import {
  Box,
  Button,
  Card,
  CircularProgress,
  Option,
  Select,
  Typography,
} from '@mui/joy';
import { FileIcon, IconType } from 'react-file-icon';
import type { GetServerSideProps, NextPage } from 'next';
import { getTotalDataPoint, getUsedDataPoint } from '@/lib/datapoints';

import { CloudUpload } from '@mui/icons-material';
import CodeInputBox from '@/components/CodeInputBox';
import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import { DurationSeconds } from '@/types/DurationSeconds';
import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';
import OSS from 'ali-oss';
import PropsBase from '@/types/PropsBase';
import React from 'react';
import { createSHA1 } from 'hash-wasm';
import { getUserInfo } from '@/lib/auth';

const HASHING_ALGORITHM = 'SHA1';

interface HomeProps extends PropsBase {
  usedDataPoint?: number;
  totalDataPoint?: number;
  ossRegion?: string;
  ossBucket?: string;
  ossEndpoint?: string;
}

const hashChunk = async (chunk: Blob, wasmHasher: IHasher) => {
  return new Promise<void>((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const view = new Uint8Array(e.target!.result as ArrayBuffer);
      wasmHasher.update(view);
      resolve();
    };
    reader.readAsArrayBuffer(chunk);
  });
};

const CHUNK_SIZE = 1024 * 1024;

const Home: NextPage<HomeProps> = ({
  userinfo,
  usedDataPoint,
  totalDataPoint,
  ossBucket,
  ossRegion,
  ossEndpoint,
}) => {
  const fileRef =
    React.useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;
  const formRef =
    React.useRef<HTMLFormElement>() as React.MutableRefObject<HTMLFormElement>;
  const [fileName, setFileName] = React.useState('');
  const [fileSizeMegabytes, setFileSizeMegabytes] = React.useState('');
  const [fileHash, setFileHash] = React.useState('');
  // const [durationSeconds, setDurationSeconds] = React.useState(0);
  const [fileExtension, setFileExtension] = React.useState('');
  const [fileType, setFileType] = React.useState('');
  const [fileTypeColor, setFileTypeColor] = React.useState('');
  const [fileLoading, setFileLoading] = React.useState(false);
  const [fileDurationSeconds, setFileDurationSeconds] = React.useState(
    DurationSeconds.TwelveHours,
  );
  let fileId: string;
  const [buttonClicked, setButtonClicked] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [fileDataPoint, setFileDataPoint] = React.useState(0);
  React.useEffect(() => {
    if (fileLoading) {
      let result: {
        extension: string;
        type?: string;
        color?: string;
      };
      fetch(`/api/v1/file/type?file_name=${fileName}`)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          result = data;
          setFileExtension(result.extension);
          setFileType(result.type!);
          setFileTypeColor(result.color!);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setFileLoading(false);
        });
    }
  }, [fileLoading, fileName, fileExtension]);
  React.useEffect(() => {
    setFileDataPoint(
      (parseFloat(fileSizeMegabytes) * fileDurationSeconds) /
        DurationSeconds.OneDay,
    );
  }, [fileSizeMegabytes, fileDurationSeconds]);
  // const extension = name!.split('.').length > 1 ? name!.split('.').pop() : '';
  // const type = getFileType(extension!);
  // const type_color = getFileTypeColor(type);
  return (
    <ContainerPageLayout
      userinfo={userinfo}
      sx={{
        py: 8,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <form hidden={true} ref={formRef}>
        <input
          type="file"
          ref={fileRef}
          multiple={false}
          onChange={async (e) => {
            setFileLoading(true);
            e.preventDefault();
            if (fileRef.current?.files) {
              const wasmHasher = await createSHA1();
              wasmHasher.init();
              const file = fileRef.current.files[0];
              const fileSize = file.size;
              setFileName(file.name);
              setFileSizeMegabytes((fileSize / 1024 / 1024).toFixed(2));
              const chunkAmounts = Math.floor(fileSize / CHUNK_SIZE);

              for (let i = 0; i <= chunkAmounts; i++) {
                const chunk = file.slice(
                  i * CHUNK_SIZE,
                  Math.min((i + 1) * CHUNK_SIZE, fileSize),
                );
                await hashChunk(chunk, wasmHasher);
              }
              const hash = wasmHasher.digest();
              setFileHash(hash);
              setFileLoading(false);
            }
          }}
        />
      </form>
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
        <Typography>
          输入文件码并回车以下载文件
          {userinfo ? '，或双击文本框以上传文件。' : '。'}
        </Typography>
        <CodeInputBox
          disabled={fileLoading}
          onDoubleClick={
            userinfo
              ? () => {
                  fileRef.current.click();
                }
              : undefined
          }
        />
        {userinfo ? (
          <Typography level="body2">
            您还可以通过点击
            <a
              href="#"
              onClick={() => {
                fileRef.current.click();
              }}
            >
              这里
            </a>
            来进行上传文件。
          </Typography>
        ) : (
          <Typography level="body2">
            若需上传，请
            <a
              href={`/api/v1/auth/login?redirect_uri=${encodeURIComponent(
                process.env.ZEITHROLD_ENDPOINT!,
              )}`}
            >
              登陆
            </a>
            。
          </Typography>
        )}
        {userinfo ? (
          <Typography level="body2">
            您的数据点: {usedDataPoint?.toFixed(2)} /{' '}
            {totalDataPoint?.toFixed(2)} DP
          </Typography>
        ) : null}
        {fileName ? (
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
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
                type={fileType as IconType}
                color={fileTypeColor}
                extension={fileExtension}
              />
            </Box>
            <Typography level="h4" textAlign="center">
              {fileName}
            </Typography>
            <Typography level="body2" textAlign="center">
              文件大小: {fileSizeMegabytes} MB
            </Typography>
            <Typography level="body2" textAlign="center">
              文件哈希: {fileHash}
            </Typography>
            <Select
              color="neutral"
              size="lg"
              defaultValue="TwelveHours"
              sx={{
                mt: 2,
              }}
              onChange={(e, newValue) => {
                if (!newValue) {
                  return;
                }
                setFileDurationSeconds(
                  DurationSeconds[newValue as keyof typeof DurationSeconds],
                );
              }}
            >
              <Option value="TwelveHours" color="neutral">
                存储 12 小时
              </Option>
              <Option value="OneDay" color="neutral">
                存储 1 天
              </Option>
              <Option value="ThreeDays" color="neutral">
                存储 3 天
              </Option>
              <Option value="SevenDays" color="neutral">
                存储 7 天
              </Option>
            </Select>
            <Typography
              level="body2"
              sx={{ my: 1 }}
              color={
                fileDataPoint > totalDataPoint! - usedDataPoint!
                  ? 'danger'
                  : 'neutral'
              }
            >
              所需数据点:{' '}
              <b>
                {fileDataPoint?.toFixed(2)} /{' '}
                {(totalDataPoint! - usedDataPoint!).toFixed(2)} DP
              </b>
            </Typography>
            <Button
              disabled={
                !fileHash || fileDataPoint > totalDataPoint! - usedDataPoint!
              }
              onClick={() => {
                setButtonClicked(true);
                const body = JSON.stringify({
                  name: fileName,
                  size_megabytes: parseFloat(fileSizeMegabytes),
                  hash: HASHING_ALGORITHM + '-' + fileHash,
                  duration_seconds: fileDurationSeconds,
                });
                fetch('/api/v1/file/new', {
                  method: 'POST',
                  body,
                })
                  .then((res) => {
                    return res.json();
                  })
                  .then(
                    (data: {
                      token: {
                        AccessKeyId: string;
                        AccessKeySecret: string;
                        Expiration: string;
                        SecurityToken: string;
                      };
                      id: string;
                      path: string;
                    }) => {
                      const options = {
                        region: ossRegion,
                        accessKeyId: data.token.AccessKeyId,
                        accessKeySecret: data.token.AccessKeySecret,
                        stsToken: data.token.SecurityToken,
                        bucket: ossBucket,
                        endpoint: ossEndpoint,
                      };
                      const ossClient = new OSS(options);
                      setFileLoading(true);
                      fileId = data.id;
                      return ossClient.multipartUpload(
                        data.path,
                        fileRef.current.files![0],
                        {
                          parallel: 4,
                          progress: (p) => {
                            setProgress(p * 100);
                          },
                        },
                      );
                    },
                  )
                  .then((result) => {
                    if (result.res.status === 200) {
                      return Promise.resolve();
                    } else {
                      console.error(result);
                    }
                  })
                  .then(() => {
                    return fetch(`/api/v1/file/${fileId}`, {
                      method: 'HEAD',
                    });
                  })
                  .then(() => {
                    setFileLoading(false);
                    window.location.href = '/file/success?id=' + fileId;
                  })
                  .catch((err) => {
                    console.log(err);
                  })
                  .finally(() => {
                    setButtonClicked(false);
                  });
              }}
              color="neutral"
              sx={{
                mb: 2,
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
                  {progress
                    ? `正在上传...${progress.toFixed(2)}%`
                    : '正在创建链接...'}
                </Box>
              ) : (
                <>
                  <CloudUpload
                    fontSize="medium"
                    sx={{
                      mr: 1,
                    }}
                  />
                  上传文件
                </>
              )}
            </Button>
          </Box>
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
      ossBucket: process.env.ZEITHROLD_ALIYUN_OSS_BUCKET!,
      ossRegion: process.env.ZEITHROLD_ALIYUN_OSS_REGION!,
      ossEndpoint: process.env.ZEITHROLD_ALIYUN_OSS_ENDPOINT!,
    },
  };
};

export default Home;

export { getServerSideProps };
