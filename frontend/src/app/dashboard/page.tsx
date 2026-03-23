"use client";

import { useEffect, useMemo, useState } from "react";
import { Thermometer, Droplets, Sun, AirVent, Tv, Computer, Wifi, WifiOff } from "lucide-react";
import { StatCard, MiniChart, DeviceTile } from "@/components/ui";
import { useMqttContext } from "@/contexts/MqttProvider";
import { apiFetch } from "@/lib";

const FALLBACK_DATA: Array<Record<string, number>> = [];
for (let i = 0; i < 30; i++) {
  FALLBACK_DATA.push({
    t: i + 1,
    temp: 23 + Math.sin(i / 4) * 2,
    hum: 55 + Math.cos(i / 5) * 6,
    lux: 700 + Math.sin(i / 3) * 150,
  });
}

export default function DashboardPage() {
  const [ac, setAc] = useState(true);
  const [tv, setTv] = useState(true);
  const [pc, setPc] = useState(false);
  const [isControlling, setIsControlling] = useState(false);
  const [controlError, setControlError] = useState<string | null>(null);

  const mqtt = useMqttContext();
  const { connected, error, sensorData, chartHistory } = mqtt ?? {};

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await apiFetch<{ items: Array<{ deviceKey: string; lastKnownState: "ON" | "OFF" | null }> }>(
          "/api/devices"
        );

        if (cancelled || !data?.items) return;

        for (const d of data.items) {
          const isOn = d.lastKnownState === "ON";
          if (d.deviceKey === "ac") setAc(isOn);
          if (d.deviceKey === "tv") setTv(isOn);
          if (d.deviceKey === "computer") setPc(isOn);
        }

      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load device states", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    // Khi chua co du lieu thuc te (chartHistory rong):
    // - Neu da ket noi MQTT thi de bieu do trong, cho den khi cam mach/bat dau publish data.
    // - Neu chua ket noi MQTT thi van show du lieu gia lap de UI khong qua trong.
    if (chartHistory && chartHistory.length > 0) return chartHistory;
    if (!connected) return FALLBACK_DATA;
    return [];
  }, [chartHistory, connected]);

  const latest = data[data.length - 1];
  const temp = sensorData?.temp ?? latest?.temp ?? 23;
  const hum = sensorData?.hum ?? latest?.hum ?? 55;
  const lux = sensorData?.lux ?? latest?.lux ?? 700;

  const refreshDeviceStates = async () => {
    const data = await apiFetch<{ items: Array<{ deviceKey: string; lastKnownState: "ON" | "OFF" | null }> }>(
      "/api/devices"
    );
    if (!data?.items) return;
    for (const d of data.items) {
      const isOn = d.lastKnownState === "ON";
      if (d.deviceKey === "ac") setAc(isOn);
      if (d.deviceKey === "tv") setTv(isOn);
      if (d.deviceKey === "computer") setPc(isOn);
    }
  };

  const waitForHardware = async (deviceKey: "ac" | "tv" | "computer", requestedOn: boolean) => {
    const deadline = Date.now() + 10_000;

    while (Date.now() < deadline) {
      try {
        const res = await apiFetch<{
          items: Array<{
            id: number;
            deviceKey: string;
            requestedState: "ON" | "OFF" | null;
            resultStatus: "WAITING" | "SUCCESS" | "FAILED";
          }>;
        }>(`/api/action-history?page=1&limit=1&deviceKey=${deviceKey}`);

        const latestAction = res.items?.[0];
        if (!latestAction) break;

        if (latestAction.resultStatus === "SUCCESS") {
          // phần cứng xác nhận, đồng bộ lại từ DB cho chắc
          await refreshDeviceStates();
          return;
        }

        if (latestAction.resultStatus === "FAILED") {
          setControlError("Thiết bị phản hồi FAILED");
          await refreshDeviceStates();
          return;
        }
      } catch {
        // bỏ qua, thử lại tới khi hết timeout
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    // Hết 10s mà vẫn WAITING => coi như FAILED tạm thời trên UI
    setControlError("Thiết bị không phản hồi trong 10 giây");
    await refreshDeviceStates();
  };

  const requestControl = async (deviceKey: "ac" | "tv" | "computer", on: boolean) => {
    setIsControlling(true);
    setControlError(null);
    try {
      await apiFetch("/api/device/control", {
        method: "POST",
        body: JSON.stringify({
          deviceKey,
          state: on ? "ON" : "OFF",
        }),
      });
      // Chờ tối đa 10s xem phần cứng phản hồi SUCCESS/FAILED
      void waitForHardware(deviceKey, on);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không gửi được lệnh điều khiển";
      setControlError(message);
      throw error;
    } finally {
      setIsControlling(false);
    }
  };

  const handleAcToggle = async (on: boolean) => {
    try {
      await requestControl("ac", on);
      setAc(on);
    } catch {
      // error already shown
    }
  };

  const handleTvToggle = async (on: boolean) => {
    try {
      await requestControl("tv", on);
      setTv(on);
    } catch {
      // error already shown
    }
  };

  const handlePcToggle = async (on: boolean) => {
    try {
      await requestControl("computer", on);
      setPc(on);
    } catch {
      // error already shown
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2 rounded-xl border-2 border-zinc-200 bg-white px-4 py-3">
        {connected ? (
          <div className="flex items-center gap-2">
            <Wifi size={20} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">Đã kết nối MQTT</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <WifiOff size={20} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">Chưa kết nối MQTT</span>
            </div>
            {error && <p className="text-xs text-red-600">Lỗi: {error}</p>}
            <p className="text-xs text-zinc-500">
              Kiểm tra: Mosquitto chạy, port 9001, user/pass trong .env.local
            </p>
          </>
        )}
        {controlError && <p className="text-xs text-red-600">Điều khiển thất bại: {controlError}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Temperature" value={Number(temp).toFixed(1)} unit="°C" tone="red" icon={<Thermometer size={28} />} />
        <StatCard title="Humidity" value={Math.round(hum).toString()} unit="%" tone="blue" icon={<Droplets size={28} />} />
        <StatCard title="Light Level" value={Math.round(lux).toString()} unit="lx" tone="amber" icon={<Sun size={28} />} />
      </div>

      <div>
        <div className="mb-4 text-lg font-bold text-zinc-900 lg:text-xl">Sensor History</div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <MiniChart label="Thermal Trend" colorTone="red" dataKey="temp" data={data} />
          <MiniChart label="Moisture Trend" colorTone="blue" dataKey="hum" data={data} />
          <MiniChart label="Lux Trend" colorTone="amber" dataKey="lux" data={data} />
        </div>
      </div>

      <div>
        <div className="mb-4 text-lg font-bold text-zinc-900 lg:text-xl">Device Control</div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DeviceTile icon={<AirVent size={24} />} title="Air Conditioner" state={ac} onToggle={handleAcToggle} />
          <DeviceTile icon={<Tv size={24} />} title="Television" state={tv} onToggle={handleTvToggle} />
          <DeviceTile icon={<Computer size={24} />} title="Computer" state={pc} onToggle={handlePcToggle} />
        </div>
        {isControlling && <p className="mt-3 text-sm text-zinc-500">Đang gửi lệnh điều khiển...</p>}
      </div>
    </div>
  );
}
