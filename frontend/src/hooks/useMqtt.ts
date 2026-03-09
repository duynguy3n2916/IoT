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
  const historyRef = useRef<Array<Record<string, number>>>([]);

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
              const t = historyRef.current.length;
              historyRef.current.push({
                t,
                temp: data.temp ?? 0,
                hum: data.hum ?? 0,
                lux: data.lux ?? 0,
              });
              if (historyRef.current.length > 24) historyRef.current.shift();
              setChartHistory([...historyRef.current]);
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
