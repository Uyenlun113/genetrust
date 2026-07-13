import * as inventoryService from '../services/inventory.service.js';

export async function listInventoryCases(req, res) {
  try {
    const data = await inventoryService.listInventoryCases();
    res.json(data);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu cho hệ thống vật tư:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi truy xuất dữ liệu.',
    });
  }
}

export async function listInventorySources(req, res) {
  try {
    const data = await inventoryService.listInventorySources(req.query);
    res.json(data);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bác sĩ cho hệ thống vật tư:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}
