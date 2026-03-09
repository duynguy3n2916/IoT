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

  const buildQuery = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    if (deviceFilter) params.set("deviceKey", deviceFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
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
  }, [deviceFilter, statusFilter, from, to]);

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
