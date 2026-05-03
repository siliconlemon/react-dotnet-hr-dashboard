import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Alert, Box, IconButton, Paper, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridRowSelectionModel,
} from '@mui/x-data-grid';
import { useMemo, type RefObject, type SyntheticEvent } from 'react';
import type { EmployeeReadDto, PtoBalanceDto } from '../../api/types';
import { useDataGridLocaleText } from '../../i18n/useDataGridLocaleText';
import { useLocale } from '../../i18n/useLocale';
import { dataGridShellSx } from '../../theme/dataGridShellSx';
import { formatDateOnly } from '../../utils/formatDate';
import { ViewLoadingGate } from '../layout/ViewLoadingGate';
import { EmployeeDetailCards } from './EmployeeDetailCards';
import { EmployeeDetailFieldsPicker } from './EmployeeDetailFieldsPicker';
import type { EmployeeProfileFieldId, EmployeePtoFieldId } from './employeeDetailFields';
import {
  activeColumnFilterFields,
  employeeColumnHideable,
  hasActiveQuickFilter,
  NAME_COLUMN_FIELD,
} from './employeesDirectoryGridModel';
import {
  DETAIL_COLLAPSED_PX,
  DETAIL_PANEL_COLLAPSED_TOP_GAP,
  detailPanelHeaderRowSx,
  detailPanelTitleTypographySx,
  SPLIT_MAX,
  SPLIT_MIN,
  type DetailPanelTier,
  type EmployeeDirectoryDetailTab,
} from './employeesDirectoryChrome';

export type EmployeesDirectoryTabProps = {
  rows: EmployeeReadDto[];
  loading: boolean;
  loadError: string | null;
  onDismissLoadError: () => void;
  selectionModel: GridRowSelectionModel;
  onSelectionChange: (model: GridRowSelectionModel) => void;
  filterModel: GridFilterModel;
  onFilterModelChange: (model: GridFilterModel) => void;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  splitContainerRef: RefObject<HTMLDivElement | null>;
  splitFraction: number;
  splitDragging: boolean;
  onSplitDraggingChange: (dragging: boolean) => void;
  detailPanelTier: DetailPanelTier;
  onMoveDetailPanelUp: () => void;
  onMoveDetailPanelDown: () => void;
  detailTab: EmployeeDirectoryDetailTab;
  onDetailTabChange: (_: SyntheticEvent, value: EmployeeDirectoryDetailTab) => void;
  selectedRows: EmployeeReadDto[];
  ptoByEmployeeId: Partial<Record<number, PtoBalanceDto>>;
  ptoErrorByEmployeeId: Partial<Record<number, boolean>>;
  ptoLoading: boolean;
  profileVisibility: Record<EmployeeProfileFieldId, boolean>;
  ptoVisibility: Record<EmployeePtoFieldId, boolean>;
  onProfileVisibilityChange: (next: Record<EmployeeProfileFieldId, boolean>) => void;
  onPtoVisibilityChange: (next: Record<EmployeePtoFieldId, boolean>) => void;
  onResetProfileFields: () => void;
  onResetPtoFields: () => void;
};

export function EmployeesDirectoryTab({
  rows,
  loading,
  loadError,
  onDismissLoadError,
  selectionModel,
  onSelectionChange,
  filterModel,
  onFilterModelChange,
  paginationModel,
  onPaginationModelChange,
  splitContainerRef,
  splitFraction,
  splitDragging,
  onSplitDraggingChange,
  detailPanelTier,
  onMoveDetailPanelUp,
  onMoveDetailPanelDown,
  detailTab,
  onDetailTabChange,
  selectedRows,
  ptoByEmployeeId,
  ptoErrorByEmployeeId,
  ptoLoading,
  profileVisibility,
  ptoVisibility,
  onProfileVisibilityChange,
  onPtoVisibilityChange,
  onResetProfileFields,
  onResetPtoFields,
}: EmployeesDirectoryTabProps) {
  const { strings } = useLocale();
  const dataGridLocaleText = useDataGridLocaleText();

  const hasQuickFilter = useMemo(() => hasActiveQuickFilter(filterModel), [filterModel]);
  const columnFilterFields = useMemo(() => activeColumnFilterFields(filterModel), [filterModel]);

  const columns: GridColDef<EmployeeReadDto>[] = useMemo(
    () => [
      {
        field: 'fullName',
        headerName: strings.employees.colName,
        flex: 1,
        minWidth: 160,
        sortable: true,
        hideable: false,
        valueGetter: (_v, row) => `${row.firstName} ${row.lastName}`.trim(),
      },
      {
        field: 'email',
        headerName: strings.employees.colEmail,
        flex: 1.2,
        minWidth: 200,
        hideable: employeeColumnHideable('email', hasQuickFilter, columnFilterFields),
      },
      {
        field: 'jobTitle',
        headerName: strings.employees.colJobTitle,
        flex: 1,
        minWidth: 120,
        hideable: employeeColumnHideable('jobTitle', hasQuickFilter, columnFilterFields),
      },
      {
        field: 'departmentName',
        headerName: strings.employees.colDepartment,
        flex: 0.9,
        minWidth: 130,
        hideable: employeeColumnHideable('departmentName', hasQuickFilter, columnFilterFields),
      },
      {
        field: 'hireDate',
        headerName: strings.employees.colHireDate,
        width: 130,
        valueFormatter: (value: string) => formatDateOnly(value),
        hideable: employeeColumnHideable('hireDate', hasQuickFilter, columnFilterFields),
      },
    ],
    [columnFilterFields, hasQuickFilter, strings],
  );

  return (
    <ViewLoadingGate rawPending={loading}>
      <Box
        ref={splitContainerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            width: '100%',
            maxWidth: (theme) => (detailPanelTier === 'expanded' ? 'none' : theme.spacing(125)),
            alignSelf: detailPanelTier === 'expanded' ? 'stretch' : 'flex-start',
            boxSizing: 'border-box',
          }}
        >
          <Paper
            sx={{
              flex: detailPanelTier === 'normal' ? '0 0 auto' : '1 1 auto',
              ...(detailPanelTier === 'normal' ? { height: `${splitFraction * 100}%` } : {}),
              minHeight: 140,
              px: 2,
              pb: 0,
              pt: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              width: '100%',
              boxSizing: 'border-box',
              opacity: detailPanelTier === 'expanded' ? 0 : 1,
              pointerEvents: detailPanelTier === 'expanded' ? 'none' : 'auto',
              transition: (theme) => theme.transitions.create('opacity', { duration: 160 }),
            }}
            variant="outlined"
          >
            {loadError && (
              <Alert severity="error" sx={{ mt: 2, mb: 0 }} onClose={onDismissLoadError}>
                {loadError}
              </Alert>
            )}
            <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={false}
                getRowId={(row) => row.id}
                density="compact"
                localeText={dataGridLocaleText}
                label={strings.employees.title}
                showToolbar
                filterModel={filterModel}
                onFilterModelChange={onFilterModelChange}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    showHistoryControls: false,
                    csvOptions: { disableToolbarButton: true },
                    printOptions: { disableToolbarButton: true },
                    quickFilterProps: {
                      debounceMs: 200,
                      slotProps: {
                        root: {
                          placeholder: strings.employees.quickFilterPlaceholder,
                          size: 'small',
                        },
                      },
                    },
                  },
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={onPaginationModelChange}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  sorting: { sortModel: [{ field: NAME_COLUMN_FIELD, sort: 'asc' }] },
                }}
                checkboxSelection
                rowSelectionModel={selectionModel}
                onRowSelectionModelChange={onSelectionChange}
                sx={{
                  ...dataGridShellSx,
                  border: 'none',
                  height: '100%',
                  '& .MuiDataGrid-toolbarContainer': { px: 0, py: 1 },
                }}
              />
            </Box>
          </Paper>

          {detailPanelTier === 'normal' && (
            <Box
              role="separator"
              aria-orientation="horizontal"
              aria-valuemin={Math.round(SPLIT_MIN * 100)}
              aria-valuemax={Math.round(SPLIT_MAX * 100)}
              aria-valuenow={Math.round(splitFraction * 100)}
              onPointerDown={(e) => {
                e.preventDefault();
                onSplitDraggingChange(true);
              }}
              sx={(theme) => ({
                flexShrink: 0,
                py: 0.75,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                cursor: 'row-resize',
                touchAction: 'none',
                userSelect: 'none',
                background: `linear-gradient(to bottom, transparent 0% 16.67%, ${theme.palette.background.default} 16.67% 83.33%, transparent 83.33% 100%)`,
                boxShadow: 'none',
                filter: 'none',
                '&:hover .EmployeesView-splitterLine': {
                  opacity: 1,
                },
                ...(splitDragging && {
                  '& .EmployeesView-splitterLine': { opacity: 1 },
                }),
              })}
            >
              <Box
                className="EmployeesView-splitterLine"
                sx={(theme) => ({
                  height: '1px',
                  width: '100%',
                  bgcolor: theme.palette.divider,
                  opacity: 0,
                  transition: theme.transitions.create('opacity', { duration: 100 }),
                })}
              />
            </Box>
          )}

          <Paper
            sx={{
              ...(detailPanelTier === 'expanded'
                ? {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 2,
                    flex: 'none',
                    maxWidth: 'none',
                  }
                : detailPanelTier === 'collapsed'
                  ? {
                      flex: '0 0 auto',
                      height: DETAIL_COLLAPSED_PX,
                      minHeight: DETAIL_COLLAPSED_PX,
                      mt: DETAIL_PANEL_COLLAPSED_TOP_GAP,
                    }
                  : {
                      flex: 1,
                      minHeight: 0,
                    }),
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              width: '100%',
              boxSizing: 'border-box',
            }}
            variant="outlined"
          >
            {detailPanelTier === 'collapsed' ? (
              <Box sx={{ ...detailPanelHeaderRowSx, height: DETAIL_COLLAPSED_PX, boxSizing: 'border-box' }}>
                <Typography variant="subtitle1" component="h2" sx={detailPanelTitleTypographySx}>
                  {strings.employees.detailTitle}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <Tooltip title={strings.employees.detailPanelRestoreSplit}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={onMoveDetailPanelUp}
                        aria-label={strings.employees.detailPanelRestoreSplit}
                      >
                        <KeyboardArrowUp />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={strings.employees.detailPanelMinimize}>
                    <span>
                      <IconButton size="small" disabled aria-label={strings.employees.detailPanelMinimize}>
                        <KeyboardArrowDown />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              <>
                <Box sx={detailPanelHeaderRowSx}>
                  <Typography variant="subtitle1" component="h2" sx={detailPanelTitleTypographySx}>
                    {strings.employees.detailTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Tooltip
                      title={
                        detailPanelTier === 'expanded'
                          ? strings.employees.detailPanelAlreadyFull
                          : strings.employees.detailPanelFullHeight
                      }
                    >
                      <span>
                        <IconButton
                          size="small"
                          onClick={onMoveDetailPanelUp}
                          disabled={detailPanelTier === 'expanded'}
                          aria-label={
                            detailPanelTier === 'expanded'
                              ? strings.employees.detailPanelAlreadyFull
                              : strings.employees.detailPanelFullHeight
                          }
                        >
                          <KeyboardArrowUp />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={
                        detailPanelTier === 'expanded'
                          ? strings.employees.detailPanelSplitWithTable
                          : strings.employees.detailPanelMinimize
                      }
                    >
                      <span>
                        <IconButton
                          size="small"
                          onClick={onMoveDetailPanelDown}
                          aria-label={
                            detailPanelTier === 'expanded'
                              ? strings.employees.detailPanelSplitWithTable
                              : strings.employees.detailPanelMinimize
                          }
                        >
                          <KeyboardArrowDown />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
                {selectedRows.length === 0 ? (
                  <Box sx={{ px: 3, py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {strings.employees.selectPrompt}
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: 1,
                        borderColor: 'divider',
                        mb: 1,
                        flexShrink: 0,
                      }}
                    >
                      <Tabs
                        value={detailTab}
                        onChange={onDetailTabChange}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          px: 1,
                          borderBottom: 0,
                          marginBlockEnd: 0,
                        }}
                      >
                        <Tab value="profile" label={strings.employees.tabProfile} />
                        <Tab value="pto" label={strings.employees.tabPto} />
                      </Tabs>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          alignSelf: 'stretch',
                          width: 48,
                          pr: 1,
                        }}
                      >
                        <EmployeeDetailFieldsPicker
                          detailTab={detailTab}
                          profileVisibility={profileVisibility}
                          ptoVisibility={ptoVisibility}
                          onProfileVisibilityChange={onProfileVisibilityChange}
                          onPtoVisibilityChange={onPtoVisibilityChange}
                          onResetProfile={onResetProfileFields}
                          onResetPto={onResetPtoFields}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pl: 2, pr: 2, pb: 2 }}>
                      <EmployeeDetailCards
                        employees={selectedRows}
                        detailTab={detailTab}
                        ptoByEmployeeId={ptoByEmployeeId}
                        ptoErrorByEmployeeId={ptoErrorByEmployeeId}
                        ptoLoading={detailTab === 'pto' && ptoLoading}
                        profileFieldVisibility={profileVisibility}
                        ptoFieldVisibility={ptoVisibility}
                      />
                    </Box>
                  </>
                )}
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </ViewLoadingGate>
  );
}
