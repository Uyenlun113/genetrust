import fs from 'fs';
import minioClient from '../minio.js';

const BUCKET_NAME = 'gennovax';
const DOMAIN = process.env.URL_MINIO || 'https://file.gennovax.vn';

export async function listDriveItems(query = {}) {
  const prefix = query.path || '';
  const search = query.search?.toLowerCase() || '';

  const objects = [];
  const stream = minioClient.listObjectsV2(BUCKET_NAME, prefix, false);

  return new Promise((resolve, reject) => {
    stream.on('data', function (obj) {
      if (obj.prefix) {
        const folderName = obj.prefix.replace(prefix, '').replace('/', '');
        if (folderName && folderName.toLowerCase().includes(search)) {
          objects.push({ type: 'folder', name: folderName, path: obj.prefix });
        }
      } else if (obj.name !== prefix) {
        const fileName = obj.name.replace(prefix, '');
        if (fileName && fileName.toLowerCase().includes(search)) {
          objects.push({
            type: 'file',
            name: fileName,
            path: obj.name,
            size: obj.size,
            lastModified: obj.lastModified,
            url: `${DOMAIN}/${BUCKET_NAME}/${obj.name}`,
          });
        }
      }
    });

    stream.on('end', function () {
      resolve({ success: true, data: objects });
    });

    stream.on('error', function (err) {
      reject(err);
    });
  });
}

export async function createDriveFolder(body = {}) {
  const { currentPath, folderName } = body;
  if (!folderName) throw new Error('Tên thư mục không được để trống');

  const objectName = `${currentPath}${folderName}/`;
  await minioClient.putObject(BUCKET_NAME, objectName, Buffer.from(''));

  return { success: true, message: 'Tạo thư mục thành công' };
}

export async function uploadDriveFile(file, body = {}) {
  const { path: tempPath, originalname, mimetype } = file;
  const currentPath = body.currentPath || '';

  const safeFileName =
    Date.now() + '_' + originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
  const objectName = `${currentPath}${safeFileName}`;

  await minioClient.fPutObject(BUCKET_NAME, objectName, tempPath, {
    'Content-Type': mimetype,
  });
  fs.unlinkSync(tempPath);

  return { success: true, url: `${DOMAIN}/${BUCKET_NAME}/${objectName}` };
}

export async function deleteDriveItem(body = {}) {
  const { path, type } = body;

  if (type === 'file') {
    await minioClient.removeObject(BUCKET_NAME, path);
  } else if (type === 'folder') {
    const objectsList = [];
    const stream = minioClient.listObjectsV2(BUCKET_NAME, path, true);

    for await (const obj of stream) {
      objectsList.push(obj.name);
    }

    if (objectsList.length > 0) {
      await minioClient.removeObjects(BUCKET_NAME, objectsList);
    }
  }

  return { success: true };
}
