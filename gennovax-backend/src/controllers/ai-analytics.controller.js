import * as aiAnalyticsService from '../services/ai-analytics.service.js';

export async function askAnalytics(req, res) {
  try {
    const data = await aiAnalyticsService.askAnalytics(req.body);
    res.json(data);
  } catch (error) {
    console.error('Lỗi AI Analytics:', error);
    if (error?.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({
      source: 'error',
      answer: 'Xin lỗi, hiện tại tôi đang không thể xử lý dữ liệu từ DB.',
    });
  }
}

export async function askInfo(req, res) {
  try {
    const data = await aiAnalyticsService.askInfo(req.body);
    res.json(data);
  } catch (error) {
    console.error('Lỗi AI đọc file tĩnh:', error);
    if (error?.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({
      source: 'error',
      answer: 'Hệ thống tư vấn đang bận, vui lòng thử lại sau',
    });
  }
}
