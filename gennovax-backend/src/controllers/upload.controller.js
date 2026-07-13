import * as uploadService from '../services/upload.service.js';

export async function uploadCaseFile(req, res) {
  try {
    const data = await uploadService.uploadCaseFile(req.file, req.body);
    res.json(data);
  } catch (err) {
    console.error('MinIO Upload Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteCaseFile(req, res) {
  try {
    const data = await uploadService.deleteCaseFile(req.body);
    res.json(data);
  } catch (err) {
    console.error('MinIO Delete Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}
