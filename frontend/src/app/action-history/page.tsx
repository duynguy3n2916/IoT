"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter } from "lucide-react";
import { Toolbar, TableShell, StatusPill } from "@/components/ui";
import { apiFetch } from "@/lib";
import { cn } from "@/lib/utils";

type ActionHistoryResponse = {
  page: number;
  limit: number;
  total: number;
  items: Array<{
    id: number;
    deviceKey: string | null;
    deviceName: string | null;
    actionType: string | null;
    requestedState: "ON" | "OFF" | null;
    resultStatus: "WAITING" | "SUCCESS" | "FAILED";
    message: string | null;
    createdAt: string;
  }>;
};

export default function ActionHistoryPage() {
  const [rows, setRows] = useState<ActionHistoryResponse["items"]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceFilter, setDeviceFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  // searchInput: giữ đúng text người dùng đang gõ.
  // searchQuery: phần gửi backend để match (sau khi đã tách ngày/giờ nếu có).
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [deviceTemp, setDeviceTemp] = useState("");
  const [statusTemp, setStatusTemp] = useState("");
  const [fromTemp, setFromTemp] = useState("");
  const [toTemp, setToTemp] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit || 1));

  const openFilter = () => {
    setDeviceTemp(deviceFilter);
    setStatusTemp(statusFilter);
    setFromTemp(from);
    setToTemp(to);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setDeviceFilter(deviceTemp);
    setStatusFilter(statusTemp);
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
  ): { fromLocal: string; toLocal: string; searchText: string } | null => {
    const value = raw.trim();
    if (!value) return null;

    // Supported patterns can appear anywhere in the string:
    // - YYYY-MM-DD
    // - YYYY-MM-DDTHH:mm
    // - dd/MM/yyyy
    // - dd/MM/yyyy HH:mm
    const dateTimeEn = /(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;
    const dateOnlyEn = /(\d{4})-(\d{2})-(\d{2})/;
    const dateTimeVn = /(\d{1,2})\/(\d{1,2})\/(\d{4})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?/;
    const dateOnlyVn = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;

    const m2 = value.match(dateTimeEn);
    if (m2) {
      const matchedStr = m2[0];
      const searchText = value.replace(matchedStr, "").trim();

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
        searchText,
      };
    }

    const m1 = value.match(dateOnlyEn);
    if (m1) {
      const matchedStr = m1[0];
      const searchText = value.replace(matchedStr, "").trim();

      const y = Number(m1[1]);
      const mo = Number(m1[2]);
      const d = Number(m1[3]);

      const fromDate = new Date(y, mo - 1, d, 0, 0, 0, 0);
      const toDate = new Date(y, mo - 1, d, 23, 59, 59, 999);
      return {
        fromLocal: toDateTimeLocalValue(fromDate),
        toLocal: toDateTimeLocalValue(toDate),
        searchText,
      };
    }

    const mv2 = value.match(dateTimeVn);
    if (mv2) {
      const matchedStr = mv2[0];
      const searchText = value.replace(matchedStr, "").trim();

      const d = Number(mv2[1]);
      const mo = Number(mv2[2]);
      const y = Number(mv2[3]);
      const h = Number(mv2[4]);
      const mi = Number(mv2[5]);
      const s = mv2[6] ? Number(mv2[6]) : 0;

      const fromDate = new Date(y, mo - 1, d, h, mi, s, 0);
      const toDate = new Date(fromDate.getTime() + 60 * 1000);
      return {
        fromLocal: toDateTimeLocalValue(fromDate),
        toLocal: toDateTimeLocalValue(toDate),
        searchText,
      };
    }

    const mv1 = value.match(dateOnlyVn);
    if (mv1) {
      const matchedStr = mv1[0];
      const searchText = value.replace(matchedStr, "").trim();

      const d = Number(mv1[1]);
      const mo = Number(mv1[2]);
      const y = Number(mv1[3]);

      const fromDate = new Date(y, mo - 1, d, 0, 0, 0, 0);
      const toDate = new Date(y, mo - 1, d, 23, 59, 59, 999);
      return {
        fromLocal: toDateTimeLocalValue(fromDate),
        toLocal: toDateTimeLocalValue(toDate),
        searchText,
      };
    }

    // Fallback: if user typed ISO string that JS can parse
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const fromDate = parsed;
      const toDate = new Date(parsed.getTime() + 60 * 1000);
      return {
        fromLocal: toDateTimeLocalValue(fromDate),
        toLocal: toDateTimeLocalValue(toDate),
        searchText: "",
      };
    }

    return null;
  };

  const buildQuery = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    if (deviceFilter) params.set("deviceKey", deviceFilter);
    if (searchQuery) params.set("search", searchQuery.trim());
    if (statusFilter) params.set("status", statusFilter);
    // Keep datetime-local value as-is to avoid timezone shifting
    // Backend will parse it with `new Date(...)`.
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/action-history?${params.toString()}`;
  };

  const loadPage = async (nextPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ActionHistoryResponse>(buildQuery(nextPage));
      setRows(data.items);
      setPage(data.page);
      setLimit(data.limit);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được action history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceFilter, statusFilter, from, to, searchQuery]);

  const uiRows = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        deviceName: r.deviceName || "—",
        requestedState: r.requestedState,
        resultStatus: r.resultStatus,
        message: r.message || "—",
        timestamp: new Date(r.createdAt).toLocaleString("vi-VN"),
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

  return (
    <div className="space-y-4">
      <Toolbar
        searchPlaceholder="Tìm kiếm"
        searchValue={searchInput}
        onSearchChange={(value) => {
          setPage(1);

          const v = value.trim();
          if (!v) {
            setSearchInput("");
            setSearchQuery("");
            setFrom("");
            setTo("");
            return;
          }

          const dtRange = extractDateTimeQuery(v);
          if (dtRange) {
            setSearchInput(value);
            setSearchQuery(dtRange.searchText);
            setFrom(dtRange.fromLocal);
            setTo(dtRange.toLocal);
            return;
          }

          setSearchInput(value);
          setSearchQuery(value);
        }}
        right={
          <div className="relative" ref={filterRef}>
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
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Thiết bị</label>
                      <select
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
                        value={deviceTemp}
                        onChange={(e) => setDeviceTemp(e.target.value)}
                      >
                        <option value="">Tất cả thiết bị</option>
                        <option value="ac">Điều hòa</option>
                        <option value="tv">TV</option>
                        <option value="computer">Máy tính</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-zinc-500">Trạng thái</label>
                      <select
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
                        value={statusTemp}
                        onChange={(e) => setStatusTemp(e.target.value)}
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="WAITING">WAITING</option>
                        <option value="SUCCESS">SUCCESS</option>
                        <option value="FAILED">FAILED</option>
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
        headers={["ID", "Thiết bị", "Lệnh", "Trạng thái", "Thông báo", "Thời gian"]}
        colSpans={[1, 2, 1, 2, 3, 3]}
        centerHeaderIndices={[2, 3]}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <span className="text-sm text-zinc-600">
              {total === 0 ? "Không có bản ghi" : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} / ${total}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-zinc-50"
                onClick={() => void loadPage(1)}
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
          <div className="px-6 py-12 text-center text-zinc-500">Chưa có lịch sử điều khiển.</div>
        ) : (
          uiRows.map((r, idx) => (
            <div key={rows[idx]?.id ?? idx} className="grid grid-cols-12 gap-2 px-6 py-4 text-sm text-zinc-700">
              <div className="col-span-1 font-mono">{rows[idx].id}</div>
              <div className="col-span-2">{r.deviceName}</div>
              <div className="col-span-1 flex justify-center">
                {r.requestedState === "ON" || r.requestedState === "OFF" ? (
                  <StatusPill value={r.requestedState} />
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </div>
              <div className="col-span-2 flex justify-center">
                <StatusPill value={r.resultStatus} />
              </div>
              <div className="col-span-3 truncate text-zinc-500" title={r.message}>{r.message}</div>
              <div className="col-span-3 text-zinc-500">{r.timestamp}</div>
            </div>
          ))
        )}
      </TableShell>
    </div>
  );
}
