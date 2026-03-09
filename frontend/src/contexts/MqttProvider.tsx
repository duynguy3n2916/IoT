"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMqtt, type SensorData } from "@/hooks/useMqtt";

type MqttContextType = {
  connected: boolean;
  error: string | null;
  sensorData: SensorData;
  chartHistory: Array<Record<string, number>>;
  publishDevice: (topic: string, on: boolean) => void;
};

const MqttContext = createContext<MqttContextType | null>(null);

export function MqttProvider({ children }: { children: ReactNode }) {
  const mqtt = useMqtt();
  return (
    <MqttContext.Provider value={mqtt}>
      {children}
    </MqttContext.Provider>
  );
}

export function useMqttContext() {
  return useContext(MqttContext);
}
