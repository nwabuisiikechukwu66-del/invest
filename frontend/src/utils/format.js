// ─────────────────────────────────────────────────────────────────────────────
// FORMAT UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

export const fmt = (n) => Number(n).toLocaleString('en-US');

export const fmtCurrency = (n, decimals = 0) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const fmtPercent = (n, decimals = 1) => `${Number(n).toFixed(decimals)}%`;

export const pct = (raised, target) => Math.min(100, Math.round((raised / target) * 100));

export const fmtDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const truncate = (str, len = 120) =>
  str.length > len ? str.slice(0, len).trimEnd() + '...' : str;
