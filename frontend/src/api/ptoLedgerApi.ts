import type {
  PtoLedgerCreateDto,
  PtoLedgerEntryReadDto,
  PtoLedgerEntryTypeDto,
  PtoLedgerPageDto,
} from './types';

const jsonHeaders = { Accept: 'application/json' } as const;

export type PtoLedgerListParams = {
  employeeId?: number;
  departmentId?: number;
  fromDate?: string;
  toDate?: string;
  entryType?: PtoLedgerEntryTypeDto | '';
  page: number;
  pageSize: number;
};

/**
 * Paginated org-wide PTO ledger; omit filters to scan the full ledger (subject to paging).
 */
/**
 * Loads every usage-type ledger row in `[fromDate, toDate]` by paging (server max page size is 200).
 */
export async function fetchPtoLedgerUsageInRange(
  fromDate: string,
  toDate: string,
  signal?: AbortSignal,
): Promise<PtoLedgerEntryReadDto[]> {
  const pageSize = 200;
  let page = 0;
  const all: PtoLedgerEntryReadDto[] = [];
  while (true) {
    const res = await fetchPtoLedgerPage(
      {
        fromDate,
        toDate,
        entryType: 'usage',
        page,
        pageSize,
      },
      signal,
    );
    all.push(...res.items);
    if (all.length >= res.totalCount || res.items.length === 0) break;
    page += 1;
  }
  return all;
}

export async function fetchPtoLedgerPage(
  params: PtoLedgerListParams,
  signal?: AbortSignal,
): Promise<PtoLedgerPageDto> {
  const qs = new URLSearchParams();
  if (params.employeeId != null) qs.set('employeeId', String(params.employeeId));
  if (params.departmentId != null) qs.set('departmentId', String(params.departmentId));
  if (params.fromDate) qs.set('fromDate', params.fromDate);
  if (params.toDate) qs.set('toDate', params.toDate);
  if (params.entryType) qs.set('entryType', params.entryType);
  qs.set('page', String(params.page));
  qs.set('pageSize', String(params.pageSize));
  const res = await fetch(`/api/pto-ledger?${qs.toString()}`, { headers: jsonHeaders, signal });
  if (!res.ok) {
    throw new Error('pto_ledger_fetch_failed');
  }
  return res.json() as Promise<PtoLedgerPageDto>;
}

/**
 * Creates one ledger row per affected employee. Returns saved rows (length 1 or department headcount).
 */
export async function createPtoLedgerEntries(
  body: PtoLedgerCreateDto,
  signal?: AbortSignal,
): Promise<PtoLedgerEntryReadDto[]> {
  const res = await fetch('/api/pto-ledger', {
    method: 'POST',
    headers: { ...jsonHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (res.status === 201) {
    return res.json() as Promise<PtoLedgerEntryReadDto[]>;
  }
  const text = (await res.text()).trim();
  const err = new Error(text || 'pto_ledger_create_failed') as Error & { status: number };
  err.status = res.status;
  throw err;
}
