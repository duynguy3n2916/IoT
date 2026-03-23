"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MQTT_CONFIG } from "@/config/mqtt";
import type { MqttClient } from "mqtt";

export type SensorData = {
  temp?: number;
  hum?: number;
  lux?: number;
};

export function useMqtt() {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [chartHistory, setChartHistory] = useState<Array<Record<string, number>>>([]);
  type Sample = { at: number; temp?: number; hum?: number; lux?: number };
  const historyRef = useRef<Array<Sample>>([]);
  // 30 diem tuong trung cho ~1 phut gan nhat (~60s), moi diem ~2 giay.
  const MAX_CHART_POINTS = 30;
  const WINDOW_MS = 60_000;
  const STEP_MS = Math.floor(WINDOW_MS / MAX_CHART_POINTS);

  useEffect(() => {
    let mqttClient: MqttClient | null = null;

    const init = async () => {
      const mqtt = (await import("mqtt")).default;
      const url = MQTT_CONFIG.brokerUrl;
      const opts: { clean?: boolean; connectTimeout?: number; reconnectPeriod?: number; username?: string; password?: string } = {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 2000,
      };
      if (MQTT_CONFIG.username) {
        opts.username = MQTT_CONFIG.username;
        opts.password = MQTT_CONFIG.password;
      }

      mqttClient = mqtt.connect(url, opts);

      mqttClient.on("connect", () => {
        setConnected(true);
        setError(null);
        mqttClient?.subscribe(MQTT_CONFIG.topics.sensors);
      });

      mqttClient.on("disconnect", () => setConnected(false));
      mqttClient.on("error", (err) => {
        const msg = err?.message || String(err);
        setError(msg);
        console.error("[MQTT]", err);
      });

      mqttClient.on("message", (topic, payload) => {
        if (topic === MQTT_CONFIG.topics.sensors) {
          try {
            const raw = payload.toString();
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            const temp = Number(parsed.temp ?? parsed.temperature ?? 0);
            const hum = Number(parsed.hum ?? parsed.humidity ?? 0);
            const lux = Number(parsed.lux ?? parsed.light ?? 0);

            const data: SensorData = {};
            if (!Number.isNaN(temp)) data.temp = temp;
            if (!Number.isNaN(hum)) data.hum = hum;
            if (!Number.isNaN(lux)) data.lux = lux;

            if (Object.keys(data).length > 0) {
              setSensorData(data);

              const now = Date.now();
              historyRef.current.push({ at: now, ...data });

              // Can giu mau trong cua so thoi gian gan nhat.
              const minAt = now - WINDOW_MS - STEP_MS;
              historyRef.current = historyRef.current.filter((s) => s.at >= minAt);

              // Resample ve dung MAX_CHART_POINTS bin theo thoi gian de luon hien 30 diem.
              const start = now - WINDOW_MS;
              let lastTemp = 0;
              let lastHum = 0;
              let lastLux = 0;

              // historyRef.current duoc push theo thoi gian tang dan, nhung filter co the giu nguyen thu tu.
              let sampleIdx = 0;
              const samples = historyRef.current;

              const bins: Array<Record<string, number>> = [];
              for (let i = 0; i < MAX_CHART_POINTS; i++) {
                const binStart = start + i * STEP_MS;
                const binEnd = start + (i + 1) * STEP_MS;
                // Dung cho tooltip: hiển thị "thời gian đại diện" của bin (midpoint)
                const binTs = Math.floor((binStart + binEnd) / 2);
                while (sampleIdx < samples.length && samples[sampleIdx].at <= binEnd) {
                  const s = samples[sampleIdx];
                  if (s.temp !== undefined) lastTemp = s.temp;
                  if (s.hum !== undefined) lastHum = s.hum;
                  if (s.lux !== undefined) lastLux = s.lux;
                  sampleIdx++;
                }

                bins.push({
                  t: i + 1, // de tooltip hien ro la diem cuoi la 30
                  ts: binTs,
                  temp: lastTemp,
                  hum: lastHum,
                  lux: lastLux,
                });
              }

              setChartHistory(bins);
            }
          } catch {
            // ignore parse errors
          }
        }
      });

      setClient(mqttClient);
    };

    init();

    return () => {
      if (mqttClient) {
        mqttClient.end();
        mqttClient = null;
      }
    };
  }, []);

  const publishDevice = useCallback(
    (topic: string, on: boolean) => {
      const payload = on ? "ON" : "OFF";
      if (client?.connected) {
        client.publish(topic, payload);
      }
    },
    [client]
  );

  return {
    connected,
    error,
    sensorData,
    chartHistory,
    publishDevice,
  };
}
