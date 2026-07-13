import Case from '../models/Case.model.js';
import Doctor from '../models/Doctor.model.js';

export async function listInventoryCases() {
  const items = await Case.find({ serviceName: { $not: /2025/ } })
    .select('-_id caseCode serviceType serviceName source receivedAt')
    .lean();

  return {
    success: true,
    total: items.length,
    data: items,
  };
}

export async function listInventorySources(query = {}) {
  const { all = '' } = query;
  const mongoQuery = {};

  if (all !== '1') {
    mongoQuery.isActive = true;
  }

  const docs = await Doctor.find(mongoQuery)
    .sort({ createdAt: -1 })
    .select('-_id fullName')
    .lean();

  const doctorNames = docs.map((d) => d.fullName);

  return {
    success: true,
    total: doctorNames.length,
    data: doctorNames,
  };
}
