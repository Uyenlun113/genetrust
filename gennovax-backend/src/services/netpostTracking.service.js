import cron from 'node-cron';
import Case from '../models/Case.model.js';

const NEWPOST_TRACKING_URL = 'https://newpost.vn/tracking';
const NEWPOST_API_FIND = 'https://api.newpost.vn/api/Bill/find';
const NEWPOST_API_CHECK = 'https://api.newpost.vn/api/Bill/cmdKiemTraVanDonCapNhatTenNguoiNhan';

const DELIVERED_KEYWORDS = [
  'đã chuyển tới',
  'đã giao',
  'giao thành công',
  'phát thành công',
  'đã nhận thư',
  'đã nhận',
  'thành công',
  'hoàn tất',
];

const CHECK_TIMEOUT_MS = 15000;
const MANUAL_CHECK_MIN_MS = 1500;

function logTracking(...args) {
  console.log('[NewpostTracking]', ...args);
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripTags(value = '') {
  return decodeHtml(String(value).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(value = '') {
  return stripTags(value).toLocaleLowerCase('vi-VN');
}

export function isDeliveredStatus(text = '') {
  const norm = normalizeText(text);
  return DELIVERED_KEYWORDS.some((kw) => norm.includes(kw));
}

export async function fetchNewpostTracking(code) {
  const safeCode = String(code || '').trim();
  if (!safeCode) throw new Error('Thiếu mã đi thư.');

  logTracking('checking', safeCode);

  let latestStatus = 'Đang chuyển phát (Newpost)';
  let latestTime = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  let isDelivered = false;

  // 1. Check API Bill/find
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const res = await fetch(NEWPOST_API_FIND, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
      body: JSON.stringify({
        maVanDon: safeCode,
        maNhanVien: '',
        maDonVi: '',
      }),
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      logTracking('api-find-res', safeCode, JSON.stringify(data));
      if (data && data.objBill) {
        const bill = data.objBill;
        latestStatus =
          bill.trangThai ||
          bill.trang_thai ||
          bill.status_name ||
          bill.note ||
          'Đang gửi thư';
        if (bill.ngayNhan || bill.ngay_phat || bill.updated_at) {
          latestTime = String(
            bill.ngayNhan || bill.ngay_phat || bill.updated_at
          );
        }
        if (isDeliveredStatus(latestStatus) || Number(bill.status) === 4) {
          isDelivered = true;
        }
        return {
          mailStatus: isDelivered ? 'Đã nhận thư' : 'Đang gửi thư',
          latestTime,
          latestStatus,
        };
      }
    }
  } catch (err) {
    logTracking('api-find-error', safeCode, err?.message || err);
  }

  // 2. Check API cmdKiemTraVanDonCapNhatTenNguoiNhan
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const res = await fetch(NEWPOST_API_CHECK, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
      body: JSON.stringify({
        maVanDon: safeCode,
        maNhanVien: '',
        maDonVi: '',
      }),
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      logTracking('api-check-res', safeCode, text);
      let parsed = null;
      try {
        parsed = typeof text === 'string' ? JSON.parse(text) : text;
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      } catch {}

      if (parsed) {
        if (parsed.status === '04' || parsed.status === 'success') {
          isDelivered = true;
          latestStatus = 'Đã giao thành công';
        } else if (parsed.status) {
          latestStatus = `Trạng thái: ${parsed.status}`;
        }
      }
    }
  } catch (err) {
    logTracking('api-check-error', safeCode, err?.message || err);
  }

  // 3. Check web tracking HTML
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const url = `${NEWPOST_TRACKING_URL}?code=${encodeURIComponent(safeCode)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      if (isDeliveredStatus(html)) {
        isDelivered = true;
        latestStatus = 'Đã nhận thư';
      }
    }
  } catch (err) {
    logTracking('html-check-error', safeCode, err?.message || err);
  }

  return {
    mailStatus: isDelivered ? 'Đã nhận thư' : 'Đang gửi thư',
    latestTime,
    latestStatus: isDelivered ? 'Giao thành công' : latestStatus,
  };
}

// Alias for backwards compatibility
export const fetchNetpostTracking = fetchNewpostTracking;

export async function checkCaseMailTracking(caseId) {
  const current = await Case.findById(caseId).lean();
  if (!current) throw new Error('Không tìm thấy ca.');

  logTracking('start-case', String(caseId), current.mailTrackingCode || '');

  const now = new Date();
  const patch = { mailLastCheckedAt: now };

  try {
    const result = await fetchNewpostTracking(current.mailTrackingCode);
    Object.assign(patch, {
      mailStatus: result.mailStatus,
      mailLatestTime: result.latestTime,
      mailLatestStatus: result.latestStatus,
      mailLastCheckError: '',
    });
  } catch (error) {
    patch.mailStatus = 'Đang gửi thư';
    patch.mailLastCheckError = error?.message || 'Không thể kiểm tra Newpost.';
    logTracking('case-error', String(caseId), patch.mailLastCheckError);
  }

  const updated = await Case.findByIdAndUpdate(caseId, patch, {
    new: true,
  }).lean();

  logTracking(
    'saved-case',
    String(caseId),
    JSON.stringify({
      mailStatus: updated?.mailStatus,
      mailLatestTime: updated?.mailLatestTime,
      mailLatestStatus: updated?.mailLatestStatus,
      mailLastCheckError: updated?.mailLastCheckError,
    })
  );

  return updated;
}

export async function checkCaseMailTrackingManual(caseId) {
  const startedAt = Date.now();
  const result = await checkCaseMailTracking(caseId);
  const remaining = MANUAL_CHECK_MIN_MS - (Date.now() - startedAt);

  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }

  return result;
}

export async function runMailTrackingScan() {
  const items = await Case.find(
    {
      mailTrackingEnabled: true,
      mailTrackingCode: { $nin: ['', null] },
      mailStatus: { $ne: 'Đã nhận thư' },
    },
    { _id: 1 }
  )
    .limit(100)
    .lean();

  logTracking('cron-scan', `${items.length} item(s)`);

  for (const item of items) {
    await checkCaseMailTracking(item._id).catch((error) => {
      console.error(
        'Newpost tracking failed:',
        item._id,
        error?.message || error
      );
    });
  }
}

export function startMailTrackingJob() {
  cron.schedule('0 */3 * * *', () => {
    void runMailTrackingScan();
  });
}
