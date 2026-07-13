import fs from 'fs';
import minioClient from '../minio.js';

const BUCKET_NAME = 'gennovax';
const DOMAIN = process.env.URL_MINIO || 'https://file.gennovax.vn';

export async function uploadCaseFile(file, body = {}) {
  const { path, originalname, mimetype } = file;
  const caseCode = body.caseCode || 'drafts';
  const safeFileName =
    Date.now() + '_' + originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
  const objectName = `${caseCode}/${safeFileName}`;

  await minioClient.fPutObject(BUCKET_NAME, objectName, path, {
    'Content-Type': mimetype,
  });

  fs.unlinkSync(path);

  return {
    success: true,
    url: `${DOMAIN}/${BUCKET_NAME}/${objectName}`,
    objectName,
  };
}

export async function deleteCaseFile(body = {}) {
  const { fileUrl } = body;
  if (!fileUrl) return { success: true };

  const prefixToRemove = `${DOMAIN}/${BUCKET_NAME}/`;
  if (fileUrl.startsWith(prefixToRemove)) {
    const objectName = fileUrl.replace(prefixToRemove, '');
    await minioClient.removeObject(BUCKET_NAME, objectName);
  }

  return { success: true };
}
