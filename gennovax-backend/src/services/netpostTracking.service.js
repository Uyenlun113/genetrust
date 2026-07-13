import cron from 'node-cron';
import Case from '../models/Case.model.js';

const NETPOST_URLS = [
  'https://netpost.vn/Home/tra_cuu_van_don',
];
const NETPOST_TRACE_URLS = [
  'https://netpost.vn/Home/ListTrackAndTrace',
];
const DELIVERED_TEXT = 'đã chuyển tới';
const CHECK_TIMEOUT_MS = 15000;
const MANUAL_CHECK_MIN_MS = 5000;

function logTracking(...args) {
  console.log('[NetpostTracking]', ...args);
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

function getDebugSnippet(html = '') {
  return stripTags(html).slice(0, 260);
}

function extractTableBody(html = '') {
  const tableMatch = String(html).match(
    /<table\b[^>]*\bid=["']listTrackAndTrace["'][^>]*>([\s\S]*?)<\/table>/i
  );
  if (!tableMatch) return '';

  const bodyMatch = tableMatch[1].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i);
  return bodyMatch ? bodyMatch[1] : tableMatch[1];
}

function extractCells(rowHtml = '') {
  return [...String(rowHtml).matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
    (match) => stripTags(match[1])
  );
}

function findLatestTrackingRow(html = '') {
  const rows = [...String(html).matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi)];

  return rows
    .map((match) => ({
      attrs: match[1] || '',
      cells: extractCells(match[2] || ''),
    }))
    .find((row) => {
      const style = row.attrs.match(/style=["']([^"']*)["']/i)?.[1] || '';
      return (
        /border-bottom/i.test(style) &&
        row.cells.length >= 2 &&
        /\d{1,2}\/\d{1,2}\/\d{4}/.test(row.cells[0])
      );
    });
}

function getRowDebug(html = '') {
  return [...String(html).matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/gi)]
    .map((match, index) => {
      const attrs = match[1] || '';
      if (!/border-bottom/i.test(attrs)) return null;

      const cells = extractCells(match[2] || '');
      return {
        index,
        attrs: stripTags(attrs).slice(0, 160),
        cellCount: cells.length,
        cells: cells.slice(0, 3),
      };
    })
    .filter(Boolean)
    .slice(0, 8);
}

function getAround(value = '', keyword = '', radius = 420) {
  const source = String(value);
  const index = source.indexOf(keyword);
  if (index < 0) return '';

  return stripTags(
    source.slice(Math.max(0, index - radius), index + keyword.length + radius)
  );
}

export function parseNetpostTracking(html = '') {
  const tbody = extractTableBody(html);
  const latestRow = findLatestTrackingRow(tbody || html);

  if (!latestRow) {
    return {
      mailStatus: 'Chưa gửi thư',
      latestTime: '',
      latestStatus: '',
    };
  }

  const latestTime = latestRow.cells[0] || '';
  const latestStatus = latestRow.cells.slice(1).join(' ').trim();
  const delivered = normalizeText(latestStatus).includes(DELIVERED_TEXT);

  return {
    mailStatus: delivered ? 'Đã nhận thư' : 'Đang gửi thư',
    latestTime,
    latestStatus,
  };
}


function findTrackingList(value) {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value;

  const candidates = [
    value.Object,
    value.ListTrackAndTrace,
    value.listTrackAndTrace,
    value.TrackAndTrace,
    value.Data,
    value.data,
    value.List,
    value.lst,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === 'object') {
      for (const nested of Object.values(candidate)) {
        if (Array.isArray(nested)) return nested;
      }
    }
  }

  for (const candidate of Object.values(value)) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === 'object') {
      for (const nested of Object.values(candidate)) {
        if (Array.isArray(nested)) return nested;
      }
    }
  }

  return [];
}

function parseNetpostJsonTracking(payload) {
  const list = findTrackingList(payload);
  const latest = list.find((item) => {
    if (!item || typeof item !== 'object') return false;

    return (
      (item.INSERT_TIME_STRING || item.InsertTimeString || item.insertTimeString) &&
      (item.DESC || item.Desc || item.desc)
    );
  });

  if (!latest) {
    return {
      mailStatus: 'Chưa gửi thư',
      latestTime: '',
      latestStatus: '',
    };
  }

  const latestTime = String(
    latest.INSERT_TIME_STRING ||
      latest.InsertTimeString ||
      latest.insertTimeString ||
      ''
  ).trim();
  const latestStatus = String(latest.DESC || latest.Desc || latest.desc || '').trim();
  const delivered = normalizeText(latestStatus).includes(DELIVERED_TEXT);

  return {
    mailStatus: delivered ? 'Đã nhận thư' : 'Đang gửi thư',
    latestTime,
    latestStatus,
  };
}

async function fetchNetpostJsonTracking(safeCode) {
  let lastError = null;

  for (const url of NETPOST_TRACE_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    try {
      const origin = new URL(url).origin;
      logTracking('fetch-json', safeCode, url);

      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Origin: origin,
          Referer:
            origin +
            '/Home/tra_cuu_van_don?hawbNo=' +
            encodeURIComponent(safeCode),
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        },
        body: new URLSearchParams({ MaBPBK: safeCode }),
      });

      if (!res.ok) throw new Error('Netpost JSON HTTP ' + res.status);

      const payload = JSON.parse(await res.text());
      const parsed = parseNetpostJsonTracking(payload);

      logTracking(
        'parsed-json',
        safeCode,
        JSON.stringify({
          status: parsed.mailStatus,
          latestTime: parsed.latestTime,
          latestStatus: parsed.latestStatus,
        })
      );

      if (
        parsed.latestTime ||
        parsed.latestStatus ||
        url === NETPOST_TRACE_URLS[NETPOST_TRACE_URLS.length - 1]
      ) {
        return parsed;
      }
    } catch (error) {
      lastError = error;
      logTracking('json-error', safeCode, url, error?.message || error);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('Không thể kiểm tra Netpost.');
}


export async function fetchNetpostTracking(code) {
  const safeCode = String(code || '').trim();
  if (!safeCode) throw new Error('Thiếu mã đi thư.');

  const jsonResult = await fetchNetpostJsonTracking(safeCode).catch((error) => {
    logTracking('json-fallback', safeCode, error?.message || error);
    return null;
  });

  if (jsonResult?.latestTime || jsonResult?.latestStatus) {
    return jsonResult;
  }

  let lastError = null;

  for (const baseUrl of NETPOST_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    try {
      const url = `${baseUrl}?hawbNo=${encodeURIComponent(safeCode)}`;
      logTracking('fetch', safeCode, url);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          Referer: baseUrl,
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        throw new Error(`Netpost HTTP ${res.status}`);
      }

      const html = await res.text();
      logTracking(
        'html-debug',
        safeCode,
        JSON.stringify({
          length: html.length,
          hasTableId: html.includes('listTrackAndTrace'),
          hasTrackingClass: html.includes('listTrackAndTraceClass'),
          hasBorderBottom: /border-bottom/i.test(html),
          snippet: getDebugSnippet(html),
        })
      );
      logTracking('row-debug', safeCode, JSON.stringify(getRowDebug(html)));
      logTracking(
        'script-debug',
        safeCode,
        JSON.stringify({
          ajax: getAround(html, '$.ajax'),
          insertTime: getAround(html, 'INSERT_TIME_STRING'),
          hawbNo: getAround(html, 'hawbNo'),
        })
      );

      const parsed = parseNetpostTracking(html);
      logTracking(
        'parsed',
        safeCode,
        JSON.stringify({
          status: parsed.mailStatus,
          latestTime: parsed.latestTime,
          latestStatus: parsed.latestStatus,
        })
      );
      if (
        parsed.latestTime ||
        parsed.latestStatus ||
        baseUrl === NETPOST_URLS[NETPOST_URLS.length - 1]
      ) {
        return parsed;
      }
    } catch (error) {
      lastError = error;
      logTracking('error', safeCode, baseUrl, error?.message || error);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('Không thể kiểm tra Netpost.');
}

export async function checkCaseMailTracking(caseId) {
  const current = await Case.findById(caseId).lean();
  if (!current) throw new Error('Không tìm thấy ca.');

  logTracking('start-case', String(caseId), current.mailTrackingCode || '');

  const now = new Date();
  const patch = { mailLastCheckedAt: now };

  try {
    const result = await fetchNetpostTracking(current.mailTrackingCode);
    Object.assign(patch, {
      mailStatus: result.mailStatus,
      mailLatestTime: result.latestTime,
      mailLatestStatus: result.latestStatus,
      mailLastCheckError: '',
    });

  } catch (error) {
    patch.mailLastCheckError = error?.message || 'Không thể kiểm tra Netpost.';
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
      console.error('Netpost tracking failed:', item._id, error?.message || error);
    });
  }
}

export function startMailTrackingJob() {
  cron.schedule('0 */3 * * *', () => {
    void runMailTrackingScan();
  });
}
