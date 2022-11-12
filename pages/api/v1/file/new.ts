import { getTotalDataPoint, getUsedDataPoint } from '@/lib/datapoints';
import { getUserInfo, verifyAccessToken } from '@/lib/auth';

import { AppDataSource } from '@/lib/database';
import { File as DbFile } from '@/lib/entity/File';
import { NextApiHandler } from 'next';
import { randomUUID } from 'crypto';
import { requestForSTSToken } from '@/lib/aliyunsts';

const FILE_CODE_MIN_LENGTH = 8;
// const FILE_CODE_MAX_LENGTH = 8;

function formatCode(code: string) {
  const length = code.length;
  const groupAmount =
    length % 4 === 0 ? length / 4 : Math.floor(length / 4) + 1;
  if (groupAmount == 1) {
    return code;
  }
  const result: string[] = [];
  for (let i = 0; i < groupAmount; i++) {
    const start = i == groupAmount - 1 ? 0 : length - (i + 1) * 4;
    const end = length - i * 4;
    const group = code.substring(start, end);
    result.push(group);
  }
  return result.reverse().join('-');
}

const handler: NextApiHandler = async (req, res) => {
  // only accept POST request
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'method_not_allowed',
    });
    return;
  }
  const error = await verifyAccessToken(req, res);
  if (error) {
    return;
  }

  const userinfo = await getUserInfo(req, res);
  if (!userinfo!.sub) {
    res.status(400).json({
      error: 'invalid_openid',
    });
    return;
  }

  // required params:
  // name, size_megabytes, duration_seconds, hash
  // for hash, a hashing algorithm is required.
  //   expected form:
  //     [hashing_algorithm]-[hash]
  //   example:
  //     SHA1-1234567890abcdef1234567890abcdef12345678

  // verify required params

  const requestBody =
    typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  if (!requestBody.name) {
    res.status(400).json({
      error: 'name_required',
    });
    return;
  }
  if (!requestBody.size_megabytes) {
    res.status(400).json({
      error: 'size_megabytes_required',
    });
    return;
  }
  // check if size_megabytes is a number
  if (isNaN(Number(requestBody.size_megabytes))) {
    res.status(400).json({
      error: 'size_megabytes_invalid',
    });
    return;
  }
  if (!requestBody.duration_seconds) {
    res.status(400).json({
      error: 'duration_seconds_required',
    });
    return;
  }
  // check if duration_seconds is a number
  if (isNaN(Number(requestBody.duration_seconds))) {
    res.status(400).json({
      error: 'duration_seconds_invalid',
    });
    return;
  }
  if (!requestBody.hash) {
    res.status(400).json({
      error: 'hash_required',
    });
    return;
  }
  // verify hash
  const fileHash = (requestBody.hash as string).toUpperCase();
  const fileHashSplit = fileHash.split('-');
  if (fileHashSplit.length !== 2) {
    res.status(400).json({
      error: 'invalid_hash',
    });
    return;
  }
  let fileCode = '';
  // generate file code randomly
  // whose length is between FILE_CODE_MIN_LENGTH and FILE_CODE_MAX_LENGTH
  // which is splited each 4 characters with a dash
  // and is unique
  let isFileCodeDuplicate: boolean = false;
  const totalDatapoints = await getTotalDataPoint(requestBody.openid);
  const usedDatapoints = await getUsedDataPoint(requestBody.openid);
  if (
    usedDatapoints +
      requestBody.size_megabytes /
        (requestBody.duration_seconds / 60 / 60 / 24) >
    totalDatapoints
  ) {
    res.status(400).json({
      error: 'datapoint_not_enough',
    });
    return;
  }
  do {
    fileCode = '';
    isFileCodeDuplicate = false;
    while (fileCode.length < FILE_CODE_MIN_LENGTH) {
      const addChar = Math.floor(Math.random() * 10).toString();
      if (fileCode === '' && addChar === '0') {
        continue;
      }
      fileCode += addChar;
    }
    fileCode = formatCode(fileCode);
    const fileRepository = await AppDataSource.getRepository(DbFile);
    isFileCodeDuplicate = (await fileRepository.findOneBy({
      code: fileCode,
    }))
      ? true
      : false;
  } while (isFileCodeDuplicate);
  const file = new DbFile();
  file.name = requestBody.name as string;
  const currentDate = new Date();
  const fileId = randomUUID();
  file.created_at = currentDate;
  file.size_megabytes = parseFloat(requestBody.size_megabytes as string);
  file.hash = fileHash;
  file.file_id = fileId;
  file.code = fileCode;
  file.storage_duration_seconds = parseInt(
    requestBody.duration_seconds as string,
  );
  file.status = 'created';
  file.openid = userinfo?.sub as string;
  // console.log(file);

  const fileRepository = DbFile.getRepository();
  await fileRepository.save(file);
  // now accuqire aliyun sts token
  const filePath =
    '/' + [fileId, fileHash, encodeURIComponent(file.name)].join('/');
  const stsToken = await (
    await requestForSTSToken({
      filePath,
      action: 'oss:PutObject',
      openid: userinfo!.sub,
    })
  ).Credentials;

  res.status(200).json({
    id: fileId,
    token: stsToken,
    path: filePath.slice(1),
  });
};

export default handler;
