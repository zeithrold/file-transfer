import type { NextApiRequest, NextApiResponse } from 'next';
import { getFileType, getFileTypeColor } from '@/lib/file';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // the param 'file_name' must be included.
  if (!req.query.file_name) {
    res.status(400).json({
      error: 'file_name_required',
    });
    return;
  }
  const fileName = req.query.file_name as string;
  const fileExtension = fileName.split('.').pop() as string;
  const fileType = getFileType(fileExtension);
  const fileTypeColor = getFileTypeColor(fileType);
  res.status(200).json({
    extension: fileExtension,
    type: fileType,
    color: fileTypeColor,
  });
}
