import { AppDataSource } from './database';
import { File as DbFile } from './entity';
import { MoreThan } from 'typeorm';
import { datapoint } from './datapoints';

export const fileTypeColors: {
  [key: string]: string;
} = {
  image: '#FFC107',
  video: '#FF5722',
  audio: '#4CAF50',
  document: '#2196F3',
  archive: '#9C27B0',
  code: '#795548',
  code2: '#607D8B',
  acrobat: '#F44336',
  spreadsheet: '#8BC34A',
  presentation: '#00BCD4',
};

export const fileTypes: {
  [key: string]: string[];
} = {
  presentation: ['ppt', 'pptx', 'pps', 'ppsx', 'pot', 'potx', 'odp'],
  image: [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'svg',
    'webp',
    'psd',
    'tiff',
    'raw',
    'heif',
    'indd',
    'ai',
    'eps',
  ],
  drive: ['dmg', 'iso', 'img', 'toast', 'vcd', 'wim', 'bin', 'esd'],
  binary: ['exe', 'msi', 'pkg', 'deb', 'rpm'],
  code: [
    'js',
    'ts',
    'json',
    'json5',
    'py',
    'swift',
    'java',
    'c',
    'cpp',
    'h',
    'hpp',
    'cs',
    'go',
    'rb',
    'php',
    'css',
  ],
  code2: ['html', 'htm', 'xhtml', 'xml', 'xsl', 'xslt', 'rss'],
  acrobat: ['pdf'],
  document: ['doc', 'docx', 'odt', 'rtf', 'tex', 'txt', 'wpd', 'wps', 'pages'],
  spreadsheet: ['csv', 'numbers', 'ods', 'xls', 'xlsx'],
  audio: [
    'aif',
    'cda',
    'mid',
    'midi',
    'mp3',
    'mpa',
    'ogg',
    'wav',
    'wma',
    'wpl',
    'm3u',
  ],
  video: [
    '3g2',
    '3gp',
    'avi',
    'flv',
    'h264',
    'm4v',
    'mkv',
    'mov',
    'mp4',
    'mpg',
    'mpeg',
    'rm',
    'swf',
    'vob',
    'wmv',
  ],
  archive: ['7z', 'arj', 'deb', 'pkg', 'rar', 'rpm', 'gz', 'tar', 'z', 'zip'],
};

export interface FileQueryResponse {
  size_megabytes: number;
  uploaded_at: string;
  expires_at: string;
  name: string;
  storage_duration_seconds: number;
  code: string;
  dataPoint: number;
}

export async function checkFileExists(code: string) {
  const fileRepository = await AppDataSource.getRepository(DbFile);
  const file = await fileRepository.findOneBy({
    code,
    expires_at: MoreThan(new Date()),
    status: 'active',
  });
  return file ? true : false;
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
  const queryResult = await fileRepository.findBy({
    openid,
    status: 'active',
    expires_at: MoreThan(new Date()),
  });
  return queryResult.map((file) => {
    return {
      size_megabytes: file.size_megabytes!,
      uploaded_at: file.uploaded_at!.toLocaleString('zh-CN'),
      expires_at: file.expires_at!.toLocaleString('zh-CN'),
      name: file.name!,
      storage_duration_seconds: file.storage_duration_seconds!,
      code: file.code!,
      dataPoint: datapoint(
        file.size_megabytes!,
        file.storage_duration_seconds!,
      ),
    };
  });
}

export function getFileType(extension: string) {
  // get the extension
  const ext = extension.toLowerCase();
  // check if the extension is in the list of file types
  for (const type in fileTypes) {
    if (fileTypes[type].includes(ext)) {
      return type;
    }
  }
  return undefined;
}

export function getFileTypeColor(fileType: string | undefined) {
  if (fileType && fileType in fileTypeColors) {
    return fileTypeColors[fileType];
  }
  return 'gray';
}
