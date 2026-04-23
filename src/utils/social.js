export function normalizeSocialUrl(u) {
  if (!u || typeof u !== "string") return "";
  const s = u.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}
