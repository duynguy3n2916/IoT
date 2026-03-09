export const BACKEND_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000",
} as const;
