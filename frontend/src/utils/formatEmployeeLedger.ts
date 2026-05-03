import type { PtoLedgerEntryReadDto } from '../api/types';

/**
 * Single display rule for ledger-derived rows: optional roster email fills gaps when API omits `employeeEmail`.
 */
export function formatEmployeeLedgerDisplay(
  row: PtoLedgerEntryReadDto,
  rosterEmail?: string,
): string {
  const name = `${row.employeeFirstName} ${row.employeeLastName}`.trim();
  const email = row.employeeEmail?.trim() || rosterEmail?.trim() || '';
  if (email && name) return `${name} (${email})`;
  if (email) return email;
  return name || `#${row.employeeId}`;
}
