import {
  Box, Tabs, Tab, Paper, Typography, Button, FormControl, Select, MenuItem,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import { SettleDrawer } from '../components/SettleDrawer';
import { SettledExpensesTab } from '../components/SettledExpensesTab';
import { BulkSettleDialog } from '../components/BulkSettleDialog';
import { usePendingSettlements } from '../hooks/useAccounts';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';
import type { PendingSettlement } from '../../../types/accounts.types';
import type { Column } from '../../../types/common.types';

function PendingSettlementsTab() {
  const { user } = useAuthContext();
  const [filterEmpId, setFilterEmpId] = useState('');
  const [expenseCode, setExpenseCode] = useState<string | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [bulkSettleOpen, setBulkSettleOpen] = useState(false);

  // Unfiltered, so the employee dropdown's options don't collapse to just the
  // currently-selected employee once a filter is applied.
  const { data: allData } = usePendingSettlements(user?.empId);
  const employees = useMemo(() => {
    const seen = new Map<string, string>();
    (allData ?? []).forEach((r) => { if (!seen.has(r.empId)) seen.set(r.empId, r.empName); });
    return Array.from(seen, ([empId, empName]) => ({ empId, empName }));
  }, [allData]);

  const { data = [], isLoading, isError, refetch } = usePendingSettlements(user?.empId, filterEmpId || undefined);

  const columns: Column<PendingSettlement>[] = [
    { id: 'empName', label: 'Employee', minWidth: 150, sortable: true },
    { id: 'expenseCode', label: 'Expense Code', minWidth: 140, sortable: true },
    { id: 'totalExpenseAmount', label: 'Total Amount', minWidth: 120, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'approvedAmount', label: 'Approved Amount', minWidth: 130, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'paidAmount', label: 'Paid Amount', minWidth: 120, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'remainingApprovedAmount', label: 'Remaining Approved', minWidth: 150, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'remainingTotalAmount', label: 'Remaining Total', minWidth: 140, render: (v) => formatCurrency(Number(v || 0)) },
  ];

  const selectedExpenses = data.filter((e) => selectedIds.includes(e.expenseId));
  // Once any row is checked, lock selection to that employee — settling across
  // different employees at once isn't supported, so other employees' rows disable.
  const selectedEmpId = selectedExpenses[0]?.empId;
  const isRowSelectable = (row: PendingSettlement) => !selectedEmpId || row.empId === selectedEmpId;
  const handleEmployeeFilterChange = (empId: string) => {
    setFilterEmpId(empId);
    setSelectedIds([]);
  };

  return (
    <Box>
      {selectedIds.length > 0 && (
        <Paper sx={{ mb: 2, borderRadius: 3, px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff4f0' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedIds.length} selected</Typography>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" size="small" onClick={() => setSelectedIds([])}>Clear</Button>
          <Button variant="contained" size="small" onClick={() => setBulkSettleOpen(true)}>
            Settle Selected
          </Button>
        </Paper>
      )}

      <DataTable<PendingSettlement & Record<string, unknown>>
        columns={columns as Column<PendingSettlement & Record<string, unknown>>[]}
        rows={data as (PendingSettlement & Record<string, unknown>)[]}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        rowKey="expenseId"
        title="Pending Settlements"
        searchPlaceholder="Search expenses..."
        showSerialNo
        onRowClick={(row) => setExpenseCode(row.expenseCode)}
        toolbarExtra={
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select value={filterEmpId} onChange={(e) => handleEmployeeFilterChange(e.target.value)} displayEmpty>
              <MenuItem value=""><em>All Employees</em></MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.empId} value={e.empId}>{e.empName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        }
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        isRowSelectable={isRowSelectable}
      />

      <SettleDrawer open={!!expenseCode} expenseCode={expenseCode} onClose={() => setExpenseCode(undefined)} />

      <BulkSettleDialog
        open={bulkSettleOpen}
        expenses={selectedExpenses}
        onClose={() => setBulkSettleOpen(false)}
        onSettled={() => setSelectedIds([])}
      />
    </Box>
  );
}

export const AccountsListPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2.5, flexShrink: 0 }}>
        <Tab label="Pending Settlements" />
        <Tab label="Settled Expenses" />
      </Tabs>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {tab === 0 ? <PendingSettlementsTab /> : <SettledExpensesTab />}
      </Box>
    </Box>
  );
};
