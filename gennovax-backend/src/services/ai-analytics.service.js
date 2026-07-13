import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import Case from '../models/Case.model.js';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY?.trim() ||
    'AIzaSyA4o8znX3UD3PpcSWVV1FNBH4mmqk03E6w',
);

const analyticsModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: `
    Bạn là trợ lý dữ liệu của phòng xét nghiệm y khoa.
    Tính cách: Chuyên nghiệp, ngắn gọn, đi thẳng vào số liệu.
    Người bạn đang nói chuyện cùng là Quản lý. Hãy gọi họ là "Quản lý" hoặc "Bạn", tuyệt đối không gọi là "Giám đốc".
    QUY TẮC ĐỊNH DẠNG:
    - Trả lời bằng văn bản thuần túy (plain text).
    - TUYỆT ĐỐI KHÔNG SỬ DỤNG Markdown (không dùng dấu sao *, không dùng dấu thăng #, không gạch đầu dòng bằng ký tự đặc biệt).
    - Dùng dấu gạch ngang (-) hoặc số thứ tự (1, 2) nếu cần liệt kê.
    - Không viết những câu mào đầu hoặc kết luận sáo rỗng. Chỉ trả lời thẳng vào số liệu.
  `,
});

const docReaderModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  systemInstruction: `
    Bạn là nhân viên tư vấn khách hàng của Gennovax. 
    Nhiệm vụ: Chỉ trả lời câu hỏi dựa trên TÀI LIỆU được cung cấp.
    Quy tắc:
    - Nếu câu trả lời có trong tài liệu, hãy trả lời ngắn gọn, lịch sự, dễ hiểu.
    - Nếu câu hỏi nằm ngoài tài liệu hoặc không liên quan, tuyệt đối không tự bịa thông tin. Hãy đáp: "Xin lỗi, tôi chưa có thông tin về vấn đề này."
    - Trả lời bằng văn bản thuần túy, TUYỆT ĐỐI KHÔNG dùng định dạng Markdown (*, #).
  `,
});

const knowledgePath = path.join(process.cwd(), 'thong_tin_gennovax.txt');
let knowledgeBase = '';

try {
  if (fs.existsSync(knowledgePath)) {
    knowledgeBase = fs.readFileSync(knowledgePath, 'utf8');
    console.log('Đã nạp thành công dữ liệu từ thong_tin_gennovax.txt');
  } else {
    console.warn(`Không tìm thấy file kiến thức tại ${knowledgePath}`);
  }
} catch (err) {
  console.error('Lỗi đọc file kiến thức:', err);
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function stripMarkdown(value = '') {
  return value.replace(/[*#_]/g, '');
}

export async function askAnalytics(body = {}) {
  const { question } = body;
  if (!question) throw createHttpError(400, 'Vui lòng đặt câu hỏi');

  const cases = await Case.find({})
    .select('caseCode serviceType receivedAt collectedAmount costPrice paid -_id')
    .lean();

  const summary = {
    tong_so_ca: cases.length,
    tong_doanh_thu: 0,
    tong_loi_nhuan: 0,
    theo_thang: {},
    theo_dich_vu: {},
  };

  cases.forEach((c) => {
    const doanhThu = c.collectedAmount || 0;
    const chiPhi = c.costPrice || 0;
    const loiNhuan = doanhThu - chiPhi;

    summary.tong_doanh_thu += doanhThu;
    summary.tong_loi_nhuan += loiNhuan;

    if (c.receivedAt) {
      const date = new Date(c.receivedAt);
      const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

      if (!summary.theo_thang[monthYear]) {
        summary.theo_thang[monthYear] = { so_ca: 0, doanh_thu: 0 };
      }
      summary.theo_thang[monthYear].so_ca += 1;
      summary.theo_thang[monthYear].doanh_thu += doanhThu;
    }

    const service = c.serviceType || 'Khác';
    if (!summary.theo_dich_vu[service]) {
      summary.theo_dich_vu[service] = { so_ca: 0, doanh_thu: 0 };
    }
    summary.theo_dich_vu[service].so_ca += 1;
    summary.theo_dich_vu[service].doanh_thu += doanhThu;
  });

  const prompt = `
      DỮ LIỆU ĐÃ TÍNH TOÁN:
      ${JSON.stringify(summary, null, 2)}
      
      Yêu cầu:
      1. Đơn vị tiền tệ là VNĐ, có dấu phẩy ngăn cách (VD: 25,000,000 VNĐ).
      2. Nếu tính % chênh lệch, công thức: ((Sau - Trước) / Trước) * 100.
      
      CÂU HỎI CỦA QUẢN LÝ:
      "${question}"
    `;

  const result = await analyticsModel.generateContent(prompt);
  const analysis = stripMarkdown(result.response.text());

  return {
    source: 'db',
    answer: analysis,
  };
}

export async function askInfo(body = {}) {
  const { question } = body;
  if (!question) throw createHttpError(400, 'Vui lòng đặt câu hỏi');

  const prompt = `
      TÀI LIỆU THAM KHẢO VỀ DỊCH VỤ:
      ---
      ${knowledgeBase}
      ---
      
      CÂU HỎI CỦA KHÁCH HÀNG:
      "${question}"
    `;

  const result = await docReaderModel.generateContent(prompt);
  const answerText = stripMarkdown(result.response.text());

  return {
    source: 'ai',
    answer: answerText,
  };
}
