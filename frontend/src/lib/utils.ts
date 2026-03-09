export function cn(...c: Array<string | null | undefined | false>) {
  return c.filter(Boolean).join(" ");
}
