/**
 * Chuỗi datetime-local gửi lên API (giờ địa phương, có giây để lọc chính xác).
 */
export function toDateTimeLocalString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const ms = d.getMilliseconds();
  if (ms > 0) {
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.${String(ms).padStart(3, "0")}`;
  }
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

export type DateTimeSearchResult = {
  fromLocal: string;
  toLocal: string;
  remainderText: string;
};

function stripMatched(full: string, matched: string): string {
  return full.replace(matched, "").trim();
}

/** Cửa sổ thời gian: có giây trong input → ~1 giây; chỉ HH:mm → ~1 phút. */
function endWindow(fromDate: Date, hasSubMinutePrecision: boolean): Date {
  const ms = hasSubMinutePrecision ? 1000 : 60 * 1000;
  return new Date(fromDate.getTime() + ms);
}

/**
 * Nhận diện ngày giờ trong ô tìm kiếm (kể cả dạng "22:03:35 22/3/2024" — giờ trước, ngày sau).
 * remainderText: phần còn lại dùng để lọc tên cảm biến / thiết bị / id.
 */
export function extractDateTimeFromSearch(raw: string): DateTimeSearchResult | null {
  const value = raw.trim();
  if (!value) return null;

  // 1) Giờ trước, ngày sau (VN): "22:03:35 22/3/2024" — phải chạy trước dateOnlyVn
  const timeFirstVn = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  const mTf = value.match(timeFirstVn);
  if (mTf) {
    const h = Number(mTf[1]);
    const mi = Number(mTf[2]);
    const sec = mTf[3] ? Number(mTf[3]) : 0;
    const d = Number(mTf[4]);
    const mo = Number(mTf[5]);
    const y = Number(mTf[6]);
    const fromDate = new Date(y, mo - 1, d, h, mi, sec, 0);
    const hasSeconds = Boolean(mTf[3]);
    const toDate = endWindow(fromDate, hasSeconds);
    return {
      fromLocal: toDateTimeLocalString(fromDate),
      toLocal: toDateTimeLocalString(toDate),
      remainderText: stripMatched(value, mTf[0]),
    };
  }

  // 2) ISO-style: YYYY-MM-DDTHH:mm(:ss)?
  const dateTimeEn = /(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;
  const m2 = value.match(dateTimeEn);
  if (m2) {
    const y = Number(m2[1]);
    const mo = Number(m2[2]);
    const d = Number(m2[3]);
    const h = Number(m2[4]);
    const mi = Number(m2[5]);
    const s = m2[6] ? Number(m2[6]) : 0;
    const fromDate = new Date(y, mo - 1, d, h, mi, s, 0);
    const hasSeconds = Boolean(m2[6]);
    const toDate = endWindow(fromDate, hasSeconds);
    return {
      fromLocal: toDateTimeLocalString(fromDate),
      toLocal: toDateTimeLocalString(toDate),
      remainderText: stripMatched(value, m2[0]),
    };
  }

  const dateOnlyEn = /(\d{4})-(\d{2})-(\d{2})/;
  const m1 = value.match(dateOnlyEn);
  if (m1) {
    const y = Number(m1[1]);
    const mo = Number(m1[2]);
    const d = Number(m1[3]);
    const fromDate = new Date(y, mo - 1, d, 0, 0, 0, 0);
    const toDate = new Date(y, mo - 1, d, 23, 59, 59, 999);
    return {
      fromLocal: toDateTimeLocalString(fromDate),
      toLocal: toDateTimeLocalString(toDate),
      remainderText: stripMatched(value, m1[0]),
    };
  }

  // 3) Ngày trước giờ sau (VN): "22/3/2024 22:03:35"
  const dateTimeVn = /(\d{1,2})\/(\d{1,2})\/(\d{4})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?/;
  const mv2 = value.match(dateTimeVn);
  if (mv2) {
    const d = Number(mv2[1]);
    const mo = Number(mv2[2]);
    const y = Number(mv2[3]);
    const h = Number(mv2[4]);
    const mi = Number(mv2[5]);
    const s = mv2[6] ? Number(mv2[6]) : 0;
    const fromDate = new Date(y, mo - 1, d, h, mi, s, 0);
    const hasSeconds = Boolean(mv2[6]);
    const toDate = endWindow(fromDate, hasSeconds);
    return {
      fromLocal: toDateTimeLocalString(fromDate),
      toLocal: toDateTimeLocalString(toDate),
      remainderText: stripMatched(value, mv2[0]),
    };
  }

  const dateOnlyVn = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  const mv1 = value.match(dateOnlyVn);
  if (mv1) {
    const d = Number(mv1[1]);
    const mo = Number(mv1[2]);
    const y = Number(mv1[3]);
    const fromDate = new Date(y, mo - 1, d, 0, 0, 0, 0);
    const toDate = new Date(y, mo - 1, d, 23, 59, 59, 999);
    return {
      fromLocal: toDateTimeLocalString(fromDate),
      toLocal: toDateTimeLocalString(toDate),
      remainderText: stripMatched(value, mv1[0]),
    };
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    const toDate = new Date(parsed.getTime() + 60 * 1000);
    return {
      fromLocal: toDateTimeLocalString(parsed),
      toLocal: toDateTimeLocalString(toDate),
      remainderText: "",
    };
  }

  return null;
}
