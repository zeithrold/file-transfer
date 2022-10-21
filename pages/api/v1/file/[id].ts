import type { NextApiRequest, NextApiResponse } from 'next';

import { AppDataSource } from '@/lib/database';
import { File as DbFile } from '@/lib/entity/File';
import { MoreThan } from 'typeorm';
import OSS from 'ali-oss';
import { requestForSTSToken } from '@/lib/aliyunsts';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const file_id = req.query.id! as string;
    const fileRepository = await AppDataSource.getRepository(DbFile);
    const file = await fileRepository.findOneBy({
      file_id,
      expires_at: MoreThan(new Date()),
    });
    if (!file) {
      res.status(404).json({
        error: 'file_not_found',
      });
      return;
    }
    const filePath = '/' + [file.file_id!, file.hash!, file.name!].join('/');
    console.log(file.openid!);
    const stsToken = (
      await requestForSTSToken({
        filePath,
        action: 'oss:GetObject',
        openid: file.openid!,
      })
    ).Credentials;
    const ossClient = new OSS({
      // cname: true,
      // endpoint: process.env.ZEITHROLD_ALIYUN_OSS_ENDPOINT!,
      region: process.env.ZEITHROLD_ALIYUN_OSS_REGION!,
      bucket: process.env.ZEITHROLD_ALIYUN_OSS_BUCKET!,
      accessKeyId: stsToken.AccessKeyId,
      accessKeySecret: stsToken.AccessKeySecret,
      stsToken: stsToken.SecurityToken,
    });

    // check if file exist in oss
    const exist = await ossClient.head(filePath);
    if (!exist) {
      res.status(404).json({
        error: 'file_not_found_in_storage',
      });
      return;
    }

    const result = ossClient.signatureUrl(filePath, {
      response: {
        'content-disposition': `attachment; filename="${file.name}"`,
      },
    });
    file.status = 'inactive';
    await fileRepository.save(file);
    res.status(200).json({
      url: result,
    });
    return;
  }
  res.status(400).json({
    error: 'invalid_method',
  });
}
