import * as driveService from '../services/drive.service.js';

export async function listDriveItems(req, res) {
  try {
    const data = await driveService.listDriveItems(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createDriveFolder(req, res) {
  try {
    const data = await driveService.createDriveFolder(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function uploadDriveFile(req, res) {
  try {
    const data = await driveService.uploadDriveFile(req.file, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteDriveItem(req, res) {
  try {
    const data = await driveService.deleteDriveItem(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
