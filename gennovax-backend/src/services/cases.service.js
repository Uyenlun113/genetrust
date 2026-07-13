import Case from '../models/Case.model.js';
import User from '../models/User.model.js';
import { computePriceAndAgent } from './pricing.service.js';
import { computeDueDate } from './dueDate.service.js';
import { checkCaseMailTrackingManual } from './netpostTracking.service.js';

function parseVNDate(val, isEnd = false) {
  if (!val) return null;

  const dateStr = String(val).split('T')[0];
  const timeStr = isEnd ? 'T23:59:59.999+07:00' : 'T00:00:00.000+07:00';
  const d = new Date(`${dateStr}${timeStr}`);

  return Number.isNaN(d.getTime()) ? null : d;
}

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function parseMultiValue(value) {
  if (!present(value)) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function buildFollowUpScope(req) {
  if (req.user?.role !== 'sales') return {};

  const user = await User.findById(req.user.id).lean();
  const salesName = String(user?.name || '').trim();
  if (!salesName) return { _id: null };

  return { salesOwner: salesName };
}

const CASE_CHANGE_LABELS = {
  caseCode: '* Mã ca',
  source: '* Nguồn',
  salesOwner: '* NVKD phụ trách',
  lab: 'Lab',
  sampleCollector: 'Thu mẫu',
  patientName: '* Họ và tên',
  patientPhone: 'SĐT',
  serviceCode: '* Dịch vụ (mã)',
  serviceName: 'Tên dịch vụ',
  collectedAmount: 'Tiền thu',
  receivedAmount: 'Tiền đã nhận',
  costPrice: 'Giá xuất vốn (Cost)',
  shippingFee: 'Phí vận chuyển',
  detailNote: 'Thông tin chi tiết thêm',
  transferStatus: '* Mức chuyển lab',
  receiveStatus: '* Tiếp nhận mẫu',
  processStatus: '* Xử lý mẫu',
  feedbackStatus: 'Phản hồi',
  receivedAt: '* Ngày nhận',
  dueDate: 'Ngày trả KQ (Dự kiến)',
  returnedAt: 'Ngày trả KQ (Thực tế)',
  paid: 'Đã thanh toán',
  paymentMethod: 'Phương thức thanh toán',
  glReturned: 'GL trả',
  gxReceived: 'GX nhận',
  softFileDone: 'Trả file mềm',
  hardFileDone: 'Trả file cứng',
  gxHardFileReceived: 'GX nhận file cứng',
  mailTrackingCode: 'Mã đi thư',
  mailStatus: 'Trạng thái thư',
  mailTrackingEnabled: 'Theo dõi thư',
  mailLatestTime: 'Thời gian thư gần nhất',
  mailLatestStatus: 'Trạng thái thư gần nhất',
  invoiceType: 'Loại hóa đơn',
  invoiceIssuedAt: 'Ngày xuất hóa đơn',
  invoiceName: 'Tên người nhận / Đơn vị',
  invoiceTaxCode: 'Mã số thuế',
  invoiceIdCard: 'Số CCCD/CMND',
  invoiceIssueDate: 'Ngày cấp',
  invoiceIssuePlace: 'Nơi cấp',
  invoiceAddress: 'Địa chỉ hóa đơn',
  registrationImageUrl: 'Ảnh đơn đăng ký',
  receiptImageUrl: 'Ảnh biên lai',
  resultImageUrls: 'Ảnh kết quả',
};

const CHANGE_LOG_SKIP_FIELDS = new Set([
  '_id',
  '__v',
  'id',
  'isDraft',
  'changes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'currentUserName',
  'currentUserEmail',
  'serviceId',
  'doctorId',
  'price',
  'agentLevel',
  'agentTierLabel',
]);

function normalizeForChangeCompare(value) {
  if (value === undefined || value === null) return '';
  if (value instanceof Date) return value.getTime();
  if (Array.isArray(value)) {
    return JSON.stringify(value.map(normalizeForChangeCompare));
  }
  if (typeof value === 'object') {
    if (
      typeof value.toString === 'function' &&
      value.toString !== Object.prototype.toString
    ) {
      return value.toString();
    }
    return JSON.stringify(value);
  }
  return value;
}

function buildCaseChangeDetails(current, patch) {
  return Object.keys(patch)
    .filter((field) => !CHANGE_LOG_SKIP_FIELDS.has(field))
    .filter((field) =>
      Object.prototype.hasOwnProperty.call(CASE_CHANGE_LABELS, field),
    )
    .reduce((details, field) => {
      const oldValue = current[field];
      const newValue = patch[field];
      if (
        normalizeForChangeCompare(oldValue) ===
        normalizeForChangeCompare(newValue)
      ) {
        return details;
      }

      details.push({
        field,
        label: CASE_CHANGE_LABELS[field],
        oldValue,
        newValue,
      });
      return details;
    }, []);
}

export async function getCasesAnalytics(query) {
  const { serviceType, month } = query;

  const match1 = {};
  if (serviceType) match1.serviceType = String(serviceType);

  const monthFilter = month && month !== 'ALL' ? { ym: String(month) } : {};

  const sourceExpr = {
    $ifNull: [
      { $cond: [{ $eq: ['$source', ''] }, null, '$source'] },
      'Chưa xác định',
    ],
  };

  const [result] = await Case.aggregate([
    { $match: match1 },
    {
      $addFields: {
        ym: {
          $dateToString: {
            format: '%Y-%m',
            date: '$receivedAt',
            timezone: 'Asia/Ho_Chi_Minh',
          },
        },
      },
    },
    {
      $facet: {
        monthlyTrend: [
          { $match: { ym: { $ne: null } } },
          {
            $group: {
              _id: '$ym',
              revenue: { $sum: { $ifNull: ['$collectedAmount', 0] } },
              cost: {
                $sum: {
                  $add: [
                    { $ifNull: ['$costPrice', 0] },
                    { $ifNull: ['$shippingFee', 0] },
                  ],
                },
              },
              cases: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              ym: '$_id',
              revenue: 1,
              cost: 1,
              cases: 1,
              netRevenue: { $subtract: ['$revenue', '$cost'] },
            },
          },
          { $sort: { ym: 1 } },
        ],
        kpis: [
          { $match: monthFilter },
          {
            $group: {
              _id: null,
              totalCases: { $sum: 1 },
              paidCases: { $sum: { $cond: ['$paid', 1, 0] } },
              totalRevenue: { $sum: { $ifNull: ['$collectedAmount', 0] } },
              totalCost: {
                $sum: {
                  $add: [
                    { $ifNull: ['$costPrice', 0] },
                    { $ifNull: ['$shippingFee', 0] },
                  ],
                },
              },
              actualNetRevenue: {
                $sum: {
                  $cond: [
                    { $eq: ['$paid', true] },
                    {
                      $subtract: [
                        { $ifNull: ['$collectedAmount', 0] },
                        {
                          $add: [
                            { $ifNull: ['$costPrice', 0] },
                            { $ifNull: ['$shippingFee', 0] },
                          ],
                        },
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalCases: 1,
              paidCases: 1,
              totalRevenue: 1,
              totalCost: 1,
              actualNetRevenue: 1,
              totalNetRevenue: { $subtract: ['$totalRevenue', '$totalCost'] },
              paidRate: {
                $cond: [
                  { $gt: ['$totalCases', 0] },
                  { $divide: ['$paidCases', '$totalCases'] },
                  0,
                ],
              },
            },
          },
        ],
        bySource: [
          { $match: monthFilter },
          {
            $group: {
              _id: sourceExpr,
              revenue: { $sum: { $ifNull: ['$collectedAmount', 0] } },
              cost: {
                $sum: {
                  $add: [
                    { $ifNull: ['$costPrice', 0] },
                    { $ifNull: ['$shippingFee', 0] },
                  ],
                },
              },
              cases: { $sum: 1 },
              paidCases: { $sum: { $cond: ['$paid', 1, 0] } },
            },
          },
          {
            $project: {
              _id: 0,
              source: '$_id',
              revenue: 1,
              cost: 1,
              cases: 1,
              paidCases: 1,
              netRevenue: { $subtract: ['$revenue', '$cost'] },
            },
          },
          { $sort: { netRevenue: -1, cases: -1 } },
        ],
        byService: [
          { $match: monthFilter },
          {
            $group: {
              _id: { code: '$serviceCode', name: '$serviceName' },
              revenue: { $sum: { $ifNull: ['$collectedAmount', 0] } },
              cost: {
                $sum: {
                  $add: [
                    { $ifNull: ['$costPrice', 0] },
                    { $ifNull: ['$shippingFee', 0] },
                  ],
                },
              },
              cases: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              serviceCode: '$_id.code',
              serviceName: '$_id.name',
              revenue: 1,
              cost: 1,
              cases: 1,
              netRevenue: { $subtract: ['$revenue', '$cost'] },
            },
          },
          { $sort: { netRevenue: -1, cases: -1 } },
        ],
      },
    },
  ]);

  return {
    kpis: result?.kpis?.[0] || {
      totalCases: 0,
      paidCases: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalNetRevenue: 0,
      paidRate: 0,
    },
    monthlyTrend: result?.monthlyTrend || [],
    bySource: result?.bySource || [],
    byService: result?.byService || [],
  };
}

export async function getLegacyFollowUpUnused(req) {
  const {
    caseCode = '',
    processStatus = '',
    salesOwner = '',
    source = '',
    payment = '',
    receiveStatus = '',
    limit = 500,
  } = req.query;

  const roleScope = await buildFollowUpScope(req);
  const baseFilter = {
    serviceName: { $not: /2025pp/ },
    ...roleScope,
  };

  const filter = { ...baseFilter };

  if (present(caseCode)) {
    filter.caseCode = {
      $regex: escapeRegex(caseCode),
      $options: 'i',
    };
  }

  if (present(processStatus)) {
    filter.processStatus = String(processStatus);
  }

  if (present(salesOwner) && req.user?.role !== 'sales') {
    filter.salesOwner = String(salesOwner);
  }

  if (present(source)) filter.source = String(source);
  if (payment === 'paid') filter.paid = true;
  if (payment === 'unpaid') filter.paid = { $ne: true };
  if (present(receiveStatus)) filter.receiveStatus = String(receiveStatus);

  const safeLimit = Math.min(Math.max(Number(limit) || 500, 1), 1000);

  const [items, total, salesOwners, sources, receiveStatuses] =
    await Promise.all([
      Case.find(filter).sort({ dueDate: 1, receivedAt: -1 }).limit(safeLimit).lean(),
      Case.countDocuments(filter),
      Case.distinct('salesOwner', baseFilter),
      Case.distinct('source', baseFilter),
      Case.distinct('receiveStatus', baseFilter),
    ]);

  return {
    items,
    total,
    filters: {
      processStatuses: ['Chưa xử lý', 'Đã có KQ'],
      salesOwners: salesOwners.filter(Boolean).sort((a, b) => a.localeCompare(b, 'vi')),
      sources: sources.filter(Boolean).sort((a, b) => a.localeCompare(b, 'vi')),
      receiveStatuses: receiveStatuses
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'vi')),
    },
    locked: {
      salesOwner: req.user?.role === 'sales',
    },
  };
}

export async function listCases(query) {
  const {
    serviceType,
    q = '',
    from = '',
    to = '',
    page = 1,
    limit = 100,
    dateSort = 'newest',
    processStatus = '',
    mailStatus = '',
    source = '',
    salesOwner = '',
    payment = '',
  } = query;

  const baseFilter = {
    serviceName: { $not: /2025pp/ },
  };

  if (serviceType && serviceType !== 'ALL') baseFilter.serviceType = serviceType;

  const fromD = parseVNDate(from, false);
  const toD = parseVNDate(to, true);

  if (fromD || toD) {
    baseFilter.receivedAt = {};
    if (fromD) baseFilter.receivedAt.$gte = fromD;
    if (toD) baseFilter.receivedAt.$lte = toD;
  }

  if (q) {
    const s = String(q);
    baseFilter.$or = [
      { caseCode: { $regex: s, $options: 'i' } },
      { patientName: { $regex: s, $options: 'i' } },
      { patientPhone: { $regex: s, $options: 'i' } },
      { serviceCode: { $regex: s, $options: 'i' } },
      { serviceName: { $regex: s, $options: 'i' } },
      { source: { $regex: s, $options: 'i' } },
    ];
  }

  const filter = { ...baseFilter };
  const processStatuses = parseMultiValue(processStatus);
  const mailStatuses = parseMultiValue(mailStatus);
  const sources = parseMultiValue(source);
  const salesOwners = parseMultiValue(salesOwner);
  const payments = parseMultiValue(payment);

  if (processStatuses.length) filter.processStatus = { $in: processStatuses };
  if (mailStatuses.length) filter.mailStatus = { $in: mailStatuses };
  if (sources.length) filter.source = { $in: sources };
  if (salesOwners.length) filter.salesOwner = { $in: salesOwners };
  if (payments.length === 1) {
    filter.paid = payments[0] === 'paid' ? true : { $ne: true };
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 10000);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;
  const sortDirection = dateSort === 'oldest' ? 1 : -1;

  const [
    items,
    total,
    processStatusValues,
    mailStatusValues,
    sourceValues,
    salesOwnerValues,
  ] = await Promise.all([
    Case.find(filter).sort({ receivedAt: sortDirection }).skip(skip).limit(safeLimit).lean(),
    Case.countDocuments(filter),
    Case.distinct('processStatus', baseFilter),
    Case.distinct('mailStatus', baseFilter),
    Case.distinct('source', baseFilter),
    Case.distinct('salesOwner', baseFilter),
  ]);

  return {
    items,
    total,
    filters: {
      processStatuses: processStatusValues
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'vi')),
      mailStatuses: mailStatusValues.filter(Boolean).sort((a, b) => a.localeCompare(b, 'vi')),
      sources: sourceValues.filter(Boolean).sort((a, b) => a.localeCompare(b, 'vi')),
      salesOwners: salesOwnerValues
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'vi')),
      payments: ['paid', 'unpaid'],
    },
  };
}

export async function getLegacyRootUnused(query) {
  const { serviceType, q = '', from = '', to = '', page = 1, limit = 100 } =
    query;

  const filter = {
    serviceName: { $not: /2025pp/ },
  };

  if (serviceType) filter.serviceType = serviceType;

  const fromD = parseVNDate(from, false);
  const toD = parseVNDate(to, true);

  if (fromD || toD) {
    filter.receivedAt = {};
    if (fromD) filter.receivedAt.$gte = fromD;
    if (toD) filter.receivedAt.$lte = toD;
  }

  if (q) {
    const s = String(q);
    filter.$or = [
      { caseCode: { $regex: s, $options: 'i' } },
      { patientName: { $regex: s, $options: 'i' } },
      { patientPhone: { $regex: s, $options: 'i' } },
      { serviceCode: { $regex: s, $options: 'i' } },
      { serviceName: { $regex: s, $options: 'i' } },
      { source: { $regex: s, $options: 'i' } },
    ];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Case.find(filter).sort({ receivedAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Case.countDocuments(filter),
  ]);

  return { items, total };
}

export async function startCaseMailTracking(id, body) {
  const code = String(body?.mailTrackingCode || '').trim();
  if (!code) {
    const error = new Error('Thiếu mã đi thư.');
    error.status = 400;
    throw error;
  }

  const updated = await Case.findByIdAndUpdate(
    id,
    {
      mailTrackingCode: code,
      mailTrackingEnabled: true,
      mailTrackingStartedAt: new Date(),
      mailStatus: 'Đang gửi thư',
      mailLastCheckError: '',
    },
    { new: true },
  ).lean();

  if (!updated) {
    const error = new Error('Not found');
    error.status = 404;
    throw error;
  }

  return checkCaseMailTrackingManual(updated._id);
}

export async function checkCaseMailTracking(id, body) {
  const code = String(body?.mailTrackingCode || '').trim();

  if (code) {
    const updated = await Case.findByIdAndUpdate(
      id,
      { mailTrackingCode: code },
      { new: true },
    ).lean();

    if (!updated) {
      const error = new Error('Not found');
      error.status = 404;
      throw error;
    }
  }

  return checkCaseMailTrackingManual(id);
}

export async function stopCaseMailTracking(id) {
  const updated = await Case.findByIdAndUpdate(
    id,
    { mailTrackingEnabled: false },
    { new: true },
  ).lean();

  if (!updated) {
    const error = new Error('Not found');
    error.status = 404;
    throw error;
  }

  return updated;
}

export async function createCase(payload = {}) {
  if (payload.caseCode && payload.caseCode.trim() !== '') {
    const existingCase = await Case.findOne({
      caseCode: payload.caseCode.trim(),
    }).lean();

    if (existingCase) {
      const error = new Error(
        `Mã ca "${payload.caseCode}" đã tồn tại trong hệ thống.`,
      );
      error.status = 400;
      throw error;
    }
  }

  payload.date = payload.date ? new Date(payload.date) : new Date();
  payload.sentAt = payload.sentAt ? new Date(payload.sentAt) : null;
  payload.receivedAt = payload.receivedAt ? new Date(payload.receivedAt) : null;
  payload.returnedAt = payload.returnedAt ? new Date(payload.returnedAt) : null;

  const userName = payload.currentUserName || 'Unknown';
  const userEmail = payload.currentUserEmail || 'Unknown';

  payload.changes = [
    {
      name: userName,
      email: userEmail,
      action: 'Tạo mới',
      changedAt: new Date(),
    },
  ];

  delete payload.currentUserName;
  delete payload.currentUserEmail;

  const info = await computePriceAndAgent({
    serviceId: payload.serviceId,
    doctorId: payload.doctorId,
  });

  payload.price = info.price;
  payload.agentLevel = payload.agentLevel || '';
  payload.agentTierLabel = info.agentTierLabel || payload.agentTierLabel || '';
  payload.serviceCode = info.serviceCode || payload.serviceCode || '';
  payload.serviceName = info.serviceName || payload.serviceName || '';

  payload.dueDate = await computeDueDate({
    doctorId: payload.doctorId,
    serviceId: payload.serviceId,
    receivedAt: payload.receivedAt,
  });

  return Case.create(payload);
}

export async function updateCase(id, patch = {}) {
  if (patch.caseCode && patch.caseCode.trim() !== '') {
    const existingCase = await Case.findOne({
      caseCode: patch.caseCode.trim(),
      _id: { $ne: id },
    }).lean();

    if (existingCase) {
      const error = new Error(
        `Mã ca "${patch.caseCode}" đã được sử dụng ở một ca khác.`,
      );
      error.status = 400;
      throw error;
    }
  }

  if ('date' in patch) patch.date = patch.date ? new Date(patch.date) : new Date();
  if ('sentAt' in patch) patch.sentAt = patch.sentAt ? new Date(patch.sentAt) : null;
  if ('receivedAt' in patch) {
    patch.receivedAt = patch.receivedAt ? new Date(patch.receivedAt) : null;
  }
  if ('dueDate' in patch) patch.dueDate = patch.dueDate ? new Date(patch.dueDate) : null;
  if ('returnedAt' in patch) {
    patch.returnedAt = patch.returnedAt ? new Date(patch.returnedAt) : null;
  }

  const current = await Case.findById(id).lean();
  if (!current) {
    const error = new Error('Not found');
    error.status = 404;
    throw error;
  }

  const changes = [...(current.changes || [])];
  const userEmail = patch.currentUserEmail || 'Unknown';
  const userName = patch.currentUserName || 'Unknown';
  const now = new Date();
  const changeDetails = buildCaseChangeDetails(current, patch);

  changes.push({
    name: userName,
    email: userEmail,
    action: 'Cập nhật',
    changedAt: now,
    details: changeDetails,
  });

  patch.changes = changes;

  delete patch.currentUserName;
  delete patch.currentUserEmail;

  const nextDoc = { ...current, ...patch };
  const changedServiceOrDoctor = 'serviceId' in patch || 'doctorId' in patch;

  if (changedServiceOrDoctor) {
    const info = await computePriceAndAgent({
      serviceId: nextDoc.serviceId,
      doctorId: nextDoc.doctorId,
    });

    patch.price = info.price;
    patch.agentLevel = nextDoc.agentLevel || '';
    patch.agentTierLabel = info.agentTierLabel || nextDoc.agentTierLabel || '';
    patch.serviceCode = info.serviceCode || nextDoc.serviceCode || '';
    patch.serviceName = info.serviceName || nextDoc.serviceName || '';
  }

  const changedDue = 'receivedAt' in patch || 'serviceId' in patch;
  if (changedDue) {
    patch.dueDate = await computeDueDate({
      doctorId: nextDoc.doctorId,
      serviceId: nextDoc.serviceId,
      receivedAt: nextDoc.receivedAt,
    });
  }

  return Case.findByIdAndUpdate(id, patch, { new: true }).lean();
}

export async function deleteCase(id) {
  await Case.findByIdAndDelete(id);
  return { ok: true };
}
