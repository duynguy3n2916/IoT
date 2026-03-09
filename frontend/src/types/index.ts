export type SensorRow = {
  id: number;
  type: "Temperature" | "Humidity" | "Light Level";
  value: string;
  timestamp: string;
};

export type ActionRow = {
  id: number;
  deviceName: string;
  action: "ON" | "OFF";
  status: "ON" | "OFF" | "WAITING";
  timestamp: string;
};

export const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "Home", href: "/dashboard" },
  { key: "sensors", label: "Data Sensors", icon: "Database", href: "/data-sensors" },
  { key: "history", label: "Action History", icon: "History", href: "/action-history" },
  { key: "profile", label: "Profile", icon: "User", href: "/profile" },
] as const;

export type PageKey = (typeof NAV)[number]["key"];
