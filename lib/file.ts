import { AppDataSource } from './database';
import { File as DbFile } from './entity';
import { datapoint } from './datapoints';

export interface FileQueryResponse {
  size_megabytes: number;
  uploaded_at: string;
  expires_at: string;
  filename: string;
  storage_duration_seconds: number;
  code: string;
  dataPoint: number;
}

export async function getFile(code: string) {
  const fileRepository = await AppDataSource.getRepository(DbFile);
  return await fileRepository.findOneBy({
    code,
  });
}

export async function getFileList(
  openid: string,
): Promise<FileQueryResponse[]> {
  const fileRepository = await AppDataSource.getRepository(DbFile);
  const queryResult = await fileRepository.find({
    where: [
      {
        openid,
        status: 'active',
      },
    ],
  });
  return queryResult.map((file) => {
    return {
      size_megabytes: file.size_megabytes!,
      uploaded_at: file.uploaded_at!.toLocaleString('zh-CN'),
      expires_at: file.expires_at!.toLocaleString('zh-CN'),
      filename: file.filename!,
      storage_duration_seconds: file.storage_duration_seconds!,
      code: file.code!,
      dataPoint: datapoint(
        file.size_megabytes!,
        file.storage_duration_seconds!,
      ),
    };
  });
}
