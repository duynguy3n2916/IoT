"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { Toolbar, TableShell } from "@/components/ui";
import { apiFetch } from "@/lib";
import { cn } from "@/lib/utils";

type SensorDataResponse = {
  page: number;
  limit: number;
  total: number;
  items: Array<{
    id: number;
    sensorKey: string;
    sensorName: string;
    value: number | string;
    unit: string | null;
    readAt: string;
  }>;
};

export default function DataSensorsPage() {
  const [rows, setRows] = useState<SensorDataResponse["items"]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sensorFilter, setSensorFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [searchSensor, setSearchSensor] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [sensorTemp, setSensorTemp] = useState("");
  const [fromTemp, setFromTemp] = useState("");
  const [toTemp, setToTemp] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / limit || 1));

  const buildQuery = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    if (sensorFilter) params.set("sensor", sensorFilter);
    // Keep datetime-local value as-is to avoid timezone shifting
    // Backend will parse it with `new Date(...)`.
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/sensors-data?${params.toString()}`;
  };

  const loadPage = async (nextPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<SensorDataResponse>(buildQuery(nextPage));
      setRows(data.items);
      setPage(data.page);
      setLimit(data.limit);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu sensor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorFilter, from, to]);

  const uiRows = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        type: r.sensorName,
        value: `${r.value}${r.unit ?? ""}`,
        timestamp: new Date(r.readAt).toLocaleString("vi-VN"),
      })),
    [rows]
  );

  const pageNumbers = useMemo(() => {
    const windowSize = 10;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const openFilter = () => {
    setSensorTemp(sensorFilter);
    setFromTemp(from);
    setToTemp(to);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setSensorFilter(sensorTemp);
    setFrom(fromTemp);
    setTo(toTemp);
    setFilterOpen(false);
  };

  const toDateTimeLocalValue = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const extractDateTimeQuery = (
    raw: string
  ): { fromLocal: string; toLocal: string; sensorText: string } | null => {
    const value = raw.trim();
    if (!value) return null;

    // Supported patterns can appear anywhere in the string
    // - YYYY-MM-DD
    // - YYYY-MM-DDTHH:mm (or with space)
    const dateTime = /(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;
    const dateOnly = /(\d{4})-(\d{2})-(\d{2})/;

    // - dd/MM/yyyy (supports non-padded day/month: 20/3/2026)
    // - dd/MM/yyyy HH:mm (or with space)
    const dateOnlyVn = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
    const dateTimeVn = /(\d{1,2})\/(\d{1,2})\/(\d{4})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?/;

    const m2 = value.match(dateTime);
    if (m2) {
      const matchedStr = m2[0];
      const sensorText = value.replace(matchedStr, "").trim();

      const y = Number(m2[1]);
      const mo = Number(m2[2]);
      const d = Number(m2[3]);
      const h = Number(m2[4]);
      const mi = Number(m2[5]);
      const s = m2[6] ? Number(m2[6]) : 0;

      const fromDate = new Date(y, mo - 1, d, h, mi, s, 0);
      const toDate = new Date(fromDate.getTime() + 60 * 1000); // +/- 1 minute window
      return {
        fromLocal: toDateTimeLocalValue(fromDate),
        toLocal: toDateTimeLocalValue(toDate),
        sensorText,
      };
    }

    const m1 = value.match(dateOnly);
    if (m1) {
      const matchedStr = m1[0];
      const sensorText = value.replace(matchedStr, "").trim();

      const y = Number(m1[1]);
      const mo = Number(m1[2]);
      const d = Number(m1[3]);

      const fromDate = new Date(y, mo - 1, d, 0, 0, 0, 0);
      const toDate = new Date(y, mo - 1, d, 23, 59, 59, 999);
      return {
        fromLocal: toDateTimeLocalValue(fromDate),
        toLocal: toDateTimeLocalValue(toDate),
        sensorText,
      };
    }

    const mv2 = value.match(dateTimeVn);
    if (mv2) {
      const matchedStr = mv2[0];
      const sensorText = value.replace(matchedStr, "").trim();

      const d = Number(mv2[1]);
      const mo = Number(mv2[2]);
      const y = Number(mv2[3]);
      const h = Number(mv2[4]);
      const mi = Number(mv2[5]);
      const s = mv2[6] ? Number(mv2[6]) : 0;

      const fromDate = new Date(y, mo - 1, d, h, mi, s, 0);
      const toDate = new Date(fromDate.getTime() + 60 * 1000); // +/- 1 minute window
      return {
        fromLocal: toDateTimeLocalValue(fromDate),
        toLocal: toDateTimeLocalValue(toDate),
        sensorText,
      };
    }

    const mv1 = value.match(dateOnlyVn);
    if (mv1) {
      const matchedStr = mv1[0];
      const sensorText = value.replace(matchedStr, "").trim();

      const d = Number(mv1[1]);
      const mo = Number(mv1[2]);
      const y = Number(mv1[3]);

      const fromDate = new Date(y, mo - 1, d, 0, 0, 0, 0);
      const toDate = new Date(y, mo - 1, d, 23, 59, 59, 999);
      return {
        fromLocal: toDateTimeLocalValue(fromDate),
        toLocal: toDateTimeLocalValue(toDate),
        sensorText,
      };
    }

    // Fallback: if user typed full ISO string that JS can parse
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const fromDate = parsed;
      const toDate = new Date(parsed.getTime() + 60 * 1000);
      return { fromLocal: toDateTimeLocalValue(fromDate), toLocal: toDateTimeLocalValue(toDate), sensorText: "" };
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <Toolbar
        searchPlaceholder="Tìm kiếm"
        searchValue={searchSensor}
        onSearchChange={(value) => {
          setSearchSensor(value);
          const v = value.trim();
          setPage(1);

          if (!v) {
            setSensorFilter("");
            setFrom("");
            setTo("");
            return;
          }

          const dtRange = extractDateTimeQuery(v);
          if (dtRange) {
            setSensorFilter(dtRange.sensorText);
            setFrom(dtRange.fromLocal);
            setTo(dtRange.toLocal);
            return;
          }

          // Otherwise treat input as sensor name/key
          setSensorFilter(v);
          setFrom("");
          setTo("");
        }}
        right={
          <div className="relative">
            <button
              type="button"
              onClick={openFilter}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50",
                filterOpen ? "border-[#1F6E8C] text-[#1F6E8C]" : "border-zinc-200"
              )}
            >
              <Filter size={18} />
              Filter
            </button>
            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-full min-w-[280px] rounded-xl border-2 border-zinc-200 bg-white p-4 shadow-lg sm:w-80">
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Loại cảm biến</label>
                      <select
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
                        value={sensorTemp}
                        onChange={(e) => setSensorTemp(e.target.value)}
                      >
                        <option value="">Tất cả cảm biến</option>
                        <option value="temp">Nhiệt độ</option>
                        <option value="hum">Độ ẩm</option>
                        <option value="lux">Ánh sáng</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Từ</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
                        value={fromTemp}
                        onChange={(e) => setFromTemp(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Đến</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
                        value={toTemp}
                        onChange={(e) => setToTemp(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyFilter}
                      className="w-full rounded-lg bg-[#1F6E8C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0F3F57]"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        }
      />
      {loading && <p className="text-sm text-zinc-500">Đang tải...</p>}
      {error && <p className="text-sm text-red-600">Lỗi: {error}</p>}
      <TableShell
        headers={["ID", "Loại cảm biến", "Giá trị", "Thời gian"]}
        colSpans={[1, 3, 2, 6]}
        centerHeaderIndices={[0, 2]}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <span className="text-sm text-zinc-600">
              {total === 0 ? "Không có bản ghi" : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} / ${total}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-zinc-50"
                onClick={() => void loadPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                Trước
              </button>
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={cn(
                    "h-8 min-w-[2rem] rounded-lg px-2 text-sm font-medium",
                    pageNum === page
                      ? "bg-[#1F6E8C] text-white"
                      : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  )}
                  onClick={() => void loadPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-zinc-50"
                onClick={() => void loadPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              >
                Sau
              </button>
            </div>
          </div>
        }
      >
        {uiRows.length === 0 && !loading ? (
          <div className="px-6 py-12 text-center text-zinc-500">Chưa có dữ liệu cảm biến.</div>
        ) : (
          uiRows.map((r, idx) => (
            <div key={rows[idx]?.id ?? idx} className="grid grid-cols-12 gap-2 px-6 py-4 text-sm text-zinc-700">
              <div className="col-span-1 flex justify-center font-mono">{r.id}</div>
              <div className="col-span-3">{r.type}</div>
              <div className="col-span-2 flex justify-center">{r.value}</div>
              <div className="col-span-6 text-zinc-500">{r.timestamp}</div>
            </div>
          ))
        )}
      </TableShell>
    </div>
  );
}
