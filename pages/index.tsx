import { Box, Card, Typography } from '@mui/joy';
import { FileIcon, IconType } from 'react-file-icon';
import type { GetServerSideProps, NextPage } from 'next';
import { getFileType, getFileTypeColor } from '@/lib/file';
import { getTotalDataPoint, getUsedDataPoint } from '@/lib/datapoints';

import CodeInputBox from '@/components/CodeInputBox';
import ContainerPageLayout from '@/layouts/ContainerPageLayout';
import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';
import PropsBase from '@/types/PropsBase';
import React from 'react';
import { createSHA1 } from 'hash-wasm';
import { getUserInfo } from '@/lib/auth';

interface HomeProps extends PropsBase {
  usedDataPoint?: number;
  totalDataPoint?: number;
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
}) => {
  const fileRef =
    React.useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;
  const [fileInputDisabled, setFileInputDisabled] = React.useState(false);
  const [fileName, setFileName] = React.useState('');
  const [fileSizeMegabytes, setFileSizeMegabytes] = React.useState('');
  const [fileHash, setFileHash] = React.useState('');
  const [durationSeconds, setDurationSeconds] = React.useState(0);
  const [fileExtension, setFileExtension] = React.useState('');
  const [fileType, setFileType] = React.useState('');
  const [fileTypeColor, setFileTypeColor] = React.useState('');

  React.useEffect(() => {
    setFileExtension(fileName.split('.').pop() || '');
    const tempFileType = getFileType(fileExtension);
    tempFileType ? setFileType(tempFileType) : null;
    tempFileType ? setFileTypeColor(getFileTypeColor(tempFileType)) : null;
  }, [fileName, fileExtension]);
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
      <form hidden={true}>
        <input
          type="file"
          ref={fileRef}
          multiple={true}
          disabled={fileInputDisabled}
          onChange={async (e) => {
            e.preventDefault();
            if (fileRef.current?.files) {
              const wasmHasher = await createSHA1();
              wasmHasher.init();
              const file = fileRef.current.files[0];
              const fileSize = file.size;
              setFileName(file.name);
              setFileSizeMegabytes((fileSize / 1024 / 1024).toFixed(2));
              const chunkAmounts = Math.floor(fileSize / CHUNK_SIZE);
              console.log(chunkAmounts);

              for (let i = 0; i <= chunkAmounts; i++) {
                const chunk = file.slice(
                  i * CHUNK_SIZE,
                  Math.min((i + 1) * CHUNK_SIZE, fileSize),
                );
                await hashChunk(chunk, wasmHasher);
              }
              const hash = wasmHasher.digest();
              setFileHash(hash);
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
          onDoubleClick={() => {
            fileRef.current.click();
          }}
        />
        <Typography level="body2">
          您还可以通过点击<a href="#">这里</a>来进行上传文件。
        </Typography>
        {userinfo ? (
          <Typography level="body2">
            您的数据点: {usedDataPoint?.toFixed(2)} /{' '}
            {totalDataPoint?.toFixed(2)} DP
          </Typography>
        ) : null}
        {fileName ? (
          <Box
            sx={{
              mt: 2,
            }}
          >
            {fileExtension ? (
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
            ) : null}
            <Typography level="h4" textAlign="center">
              文件名: {fileName}
            </Typography>
            <Typography level="body2" textAlign="center">
              文件大小: {fileSizeMegabytes} MB
            </Typography>
            <Typography level="body2" textAlign="center">
              文件哈希: {fileHash}
            </Typography>
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
    },
  };
};

export default Home;

export { getServerSideProps };
