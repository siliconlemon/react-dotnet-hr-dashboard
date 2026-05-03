import { Box, Tab, Tabs } from '@mui/material';
import type { GridFilterModel, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react';
import { fetchEmployees, fetchPtoBalance } from '../../api/employeesApi';
import type { EmployeeReadDto, PtoBalanceDto } from '../../api/types';
import { useLocale } from '../../i18n/useLocale';
import type { EmployeesViewTab } from '../../navigation/viewTabs';
import { shellUnderBarTabsSx } from '../layout/shellViewChrome';
import { EmployeeEditForm } from './EmployeeEditForm';
import { EmployeeRemoveForm } from './EmployeeRemoveForm';
import { EmployeesDirectoryTab } from './EmployeesDirectoryTab';
import {
  SPLIT_DEFAULT,
  SPLIT_MAX,
  SPLIT_MIN,
  type DetailPanelTier,
  type EmployeeDirectoryDetailTab,
} from './employeesDirectoryChrome';
import { effectiveSelectedRowIds } from './employeesDirectoryGridModel';
import { OnboardingForm } from './OnboardingForm';
import { useEmployeeDetailFieldVisibility } from './useEmployeeDetailFieldVisibility';

type EmployeesViewProps = {
  viewTab: EmployeesViewTab;
  onViewTabChange: (tab: EmployeesViewTab) => void;
};

/**
 * Employees area: directory (grid + profile/PTO), onboard, edit, or remove.
 */
export function EmployeesView({ viewTab, onViewTabChange }: EmployeesViewProps) {
  const [rows, setRows] = useState<EmployeeReadDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });
  const [detailTab, setDetailTab] = useState<EmployeeDirectoryDetailTab>('profile');
  const [ptoByEmployeeId, setPtoByEmployeeId] = useState<Partial<Record<number, PtoBalanceDto>>>({});
  const [ptoErrorByEmployeeId, setPtoErrorByEmployeeId] = useState<Partial<Record<number, boolean>>>(
    {},
  );
  const [ptoLoading, setPtoLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [splitFraction, setSplitFraction] = useState(SPLIT_DEFAULT);
  const [splitDragging, setSplitDragging] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const [detailPanelTier, setDetailPanelTier] = useState<DetailPanelTier>('normal');
  const {
    visibility: detailFieldVisibility,
    setProfileVisibility,
    setPtoVisibility,
    resetProfile: resetDetailProfileFields,
    resetPto: resetDetailPtoFields,
  } = useEmployeeDetailFieldVisibility();

  const { strings } = useLocale();

  const reloadEmployees = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchEmployees(signal);
      setRows(data);
      return data;
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') return undefined;
      setLoadError(strings.employees.listError);
      return undefined;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- stable fetch identity (same as previous empty-deps behavior)
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      await Promise.resolve();
      await reloadEmployees(ac.signal);
    })();
    return () => ac.abort();
  }, [reloadEmployees]);

  const handleEmployeeCreated = useCallback(
    (created: EmployeeReadDto) => {
      void (async () => {
        await reloadEmployees();
        onViewTabChange('directory');
        setSelectionModel({ type: 'include', ids: new Set([created.id]) });
      })();
    },
    [reloadEmployees, onViewTabChange],
  );

  const handleEmployeeUpdated = useCallback(() => {
    void (async () => {
      await reloadEmployees();
    })();
  }, [reloadEmployees]);

  const handleEmployeeRemoved = useCallback(
    (removedId: number) => {
      void (async () => {
        const data = await reloadEmployees();
        if (!data) return;
        setSelectionModel((prev) => {
          const effective = effectiveSelectedRowIds(data, prev).filter((id) => id !== removedId);
          return { type: 'include' as const, ids: new Set(effective) };
        });
      })();
    },
    [reloadEmployees],
  );

  const selectedIdsSorted = useMemo(() => {
    const arr = effectiveSelectedRowIds(rows, selectionModel);
    arr.sort((a, b) => a - b);
    return arr;
  }, [rows, selectionModel]);

  const selectedKey = selectedIdsSorted.join(',');

  const selectedRows = useMemo(
    () => selectedIdsSorted.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as EmployeeReadDto[],
    [rows, selectedIdsSorted],
  );

  useEffect(() => {
    if (detailTab !== 'pto') {
      return;
    }
    const ac = new AbortController();
    const ids = selectedIdsSorted;

    void (async () => {
      await Promise.resolve();
      if (ac.signal.aborted) return;

      if (ids.length === 0) {
        setPtoByEmployeeId({});
        setPtoErrorByEmployeeId({});
        setPtoLoading(false);
        return;
      }

      setPtoLoading(true);
      setPtoErrorByEmployeeId({});
      setPtoByEmployeeId({});

      const next: Partial<Record<number, PtoBalanceDto>> = {};
      const errs: Partial<Record<number, boolean>> = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const p = await fetchPtoBalance(id, ac.signal);
            next[id] = p;
          } catch (e: unknown) {
            if ((e as Error).name === 'AbortError') return;
            errs[id] = true;
          }
        }),
      );
      if (ac.signal.aborted) return;
      setPtoByEmployeeId(next);
      setPtoErrorByEmployeeId(errs);
      setPtoLoading(false);
    })();

    return () => ac.abort();
  }, [detailTab, selectedKey, selectedIdsSorted]);

  const handleDetailTabChange = useCallback(
    (_: SyntheticEvent, value: EmployeeDirectoryDetailTab) => {
      setDetailTab(value);
      if (value !== 'pto') {
        setPtoByEmployeeId({});
        setPtoErrorByEmployeeId({});
        setPtoLoading(false);
      }
    },
    [],
  );

  const handleViewTabChange = useCallback(
    (_: SyntheticEvent, value: EmployeesViewTab) => {
      onViewTabChange(value);
    },
    [onViewTabChange],
  );

  const onSelectionChange = useCallback((model: GridRowSelectionModel) => {
    setSelectionModel(model);
  }, []);

  const moveDetailPanelUp = useCallback(() => {
    setDetailPanelTier((t) => (t === 'collapsed' ? 'normal' : t === 'normal' ? 'expanded' : t));
  }, []);

  const moveDetailPanelDown = useCallback(() => {
    setDetailPanelTier((t) => (t === 'expanded' ? 'normal' : t === 'normal' ? 'collapsed' : t));
  }, []);

  useEffect(() => {
    if (!splitDragging) return;
    const onMove = (e: PointerEvent) => {
      const el = splitContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const h = rect.height;
      if (h <= 0) return;
      const y = e.clientY - rect.top;
      const f = y / h;
      setSplitFraction(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, f)));
    };
    const onUp = () => setSplitDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [splitDragging]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={viewTab}
        onChange={handleViewTabChange}
        sx={shellUnderBarTabsSx}
      >
        <Tab value="directory" label={strings.employees.tabDirectory} />
        <Tab value="onboard" label={strings.employees.tabOnboard} />
        <Tab value="edit" label={strings.employees.tabEdit} />
        <Tab value="remove" label={strings.employees.tabRemove} />
      </Tabs>

      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden={viewTab !== 'directory'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            opacity: viewTab === 'directory' ? 1 : 0,
            visibility: viewTab === 'directory' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'directory' ? 'auto' : 'none',
            zIndex: viewTab === 'directory' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <EmployeesDirectoryTab
            rows={rows}
            loading={loading}
            loadError={loadError}
            onDismissLoadError={() => setLoadError(null)}
            selectionModel={selectionModel}
            onSelectionChange={onSelectionChange}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            splitContainerRef={splitContainerRef}
            splitFraction={splitFraction}
            splitDragging={splitDragging}
            onSplitDraggingChange={setSplitDragging}
            detailPanelTier={detailPanelTier}
            onMoveDetailPanelUp={moveDetailPanelUp}
            onMoveDetailPanelDown={moveDetailPanelDown}
            detailTab={detailTab}
            onDetailTabChange={handleDetailTabChange}
            selectedRows={selectedRows}
            ptoByEmployeeId={ptoByEmployeeId}
            ptoErrorByEmployeeId={ptoErrorByEmployeeId}
            ptoLoading={ptoLoading}
            profileVisibility={detailFieldVisibility.profile}
            ptoVisibility={detailFieldVisibility.pto}
            onProfileVisibilityChange={setProfileVisibility}
            onPtoVisibilityChange={setPtoVisibility}
            onResetProfileFields={resetDetailProfileFields}
            onResetPtoFields={resetDetailPtoFields}
          />
        </Box>

        <Box
          aria-hidden={viewTab !== 'onboard'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: viewTab === 'onboard' ? 1 : 0,
            visibility: viewTab === 'onboard' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'onboard' ? 'auto' : 'none',
            zIndex: viewTab === 'onboard' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <OnboardingForm onCreated={handleEmployeeCreated} />
        </Box>

        <Box
          aria-hidden={viewTab !== 'edit'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: viewTab === 'edit' ? 1 : 0,
            visibility: viewTab === 'edit' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'edit' ? 'auto' : 'none',
            zIndex: viewTab === 'edit' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <EmployeeEditForm employees={rows} onUpdated={handleEmployeeUpdated} />
        </Box>

        <Box
          aria-hidden={viewTab !== 'remove'}
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            opacity: viewTab === 'remove' ? 1 : 0,
            visibility: viewTab === 'remove' ? 'visible' : 'hidden',
            pointerEvents: viewTab === 'remove' ? 'auto' : 'none',
            zIndex: viewTab === 'remove' ? 1 : 0,
            transition: (theme) =>
              theme.transitions.create(['opacity', 'visibility'], { duration: 120 }),
          }}
        >
          <EmployeeRemoveForm employees={rows} onRemoved={handleEmployeeRemoved} />
        </Box>
      </Box>
    </Box>
  );
}
