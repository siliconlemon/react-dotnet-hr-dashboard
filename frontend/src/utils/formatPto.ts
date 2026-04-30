/**
 * Renders a PTO day amount like the employee detail cards (0–2 fraction digits).
 */
export function formatPtoDays(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
