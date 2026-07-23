import { Box, Paper, Typography, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useMemo, useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import type { ActionItem } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { AdminExpenseFilters } from '../components/AdminExpenseFilters';
import { AdminExpenseDrawer } from '../components/AdminExpenseDrawer';
import { BulkSettleDialog } from '../components/BulkSettleDialog';
import { useAdminExpenseList } from '../hooks/useAdminExpenses';
import { useApprovalLimits } from '../hooks/useAdminMaster';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { resolveStatusLabel } from '../../../constants/masterData';
import type { Expense, AdminExpenseFilters as IFilters } from '../../../types/expense.types';
import { AdminActionsCard } from '../components/AdminActionsCard';
import { AdminDashboard } from '../components/AdminDashboard';
import { useAuthContext } from '../../../store/authStore';
import type { Column } from '../../../types/common.types';

interface DrawerState { open: boolean; expenseId: string | number | null }

const DRAWER_INIT: DrawerState = { open: false, expenseId: null };

export const ExpenseApprovalListPage = () => {
  const { role, user } = useAuthContext();
  const isAdminOrSuperAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isAccountsTeam = user?.department === 'Accounts';
  const [filters, setFilters] = useState<IFilters>({});
  const { data, isLoading, isError, refetch } = useAdminExpenseList(filters);
  const { data: limits = [] } = useApprovalLimits();
  const [drawer, setDrawer] = useState<DrawerState>(DRAWER_INIT);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [bulkSettleOpen, setBulkSettleOpen] = useState(false);

  const adminLimit = limits[0]?.adminLimit ?? Infinity;

  // Derive from live query data so drawer auto-updates after approve/reject
  const drawerExpense = data?.data.find(e => e.id === drawer.expenseId) ?? null;

  const selectedExpenses = useMemo(
    () => (data?.data || []).filter((e) => selectedIds.includes(e.id)),
    [data, selectedIds],
  );
  const selectedEmployeeId = selectedExpenses[0]?.employeeId;

  const isSettleable = (row: Expense) => {
    if (!isAccountsTeam) return false;
    const statusNum = Number(row.status);
    const eligible = statusNum === 4 || (statusNum === 3 && row.amount <= adminLimit);
    if (!eligible) return false;
    // A settlement bill covers one employee's expenses at a time — once a
    // selection starts, lock out rows belonging to any other employee.
    return !selectedEmployeeId || row.employeeId === selectedEmployeeId;
  };

  const columns: Column<Expense>[] = [
    { id: 'employeeName', label: 'Employee', minWidth: 130, sortable: true },
    { id: 'amount', label: 'Amount', minWidth: 110, sortable: true, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'status', label: 'Status', minWidth: 130, render: (v) => <StatusChip status={v as number} />, exportValue: (v) => resolveStatusLabel(String(v || '')) },
    { id: 'submittedOn', label: 'Submitted On', minWidth: 130, render: (v) => formatDate(String(v || '')), exportValue: (v) => formatDate(String(v || '')) },
  ];

  const rowActions = (row: Expense & Record<string, unknown>): ActionItem[] => [
    {
      label: 'View Details',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: () => setDrawer({ open: true, expenseId: row.id }),
    },
  ];

  return (
    <Box>
      {isAdminOrSuperAdmin && (
        <>
          <AdminDashboard />
          <AdminActionsCard />
        </>
      )}

      <Paper sx={{ mb: 2, borderRadius: 3 }}>
        <AdminExpenseFilters onFilter={setFilters} />
      </Paper>

      {isAccountsTeam && selectedIds.length > 0 && (
        <Paper
          sx={{
            mb: 2, borderRadius: 3, px: 2.5, py: 1.5, display: 'flex',
            alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: '#f0f4ff',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {selectedIds.length} selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {formatCurrency(selectedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0))}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" size="small" onClick={() => setSelectedIds([])}>Clear</Button>
          <Button
            variant="contained" color="info" size="small"
            startIcon={<PaymentsIcon />}
            onClick={() => setBulkSettleOpen(true)}
          >
            Settle Selected
          </Button>
        </Paper>
      )}

      <DataTable<Expense & Record<string, unknown>>
        columns={columns as Column<Expense & Record<string, unknown>>[]}
        rows={(data?.data || []) as (Expense & Record<string, unknown>)[]}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        rowKey="id"
        title="Expense Approvals"
        searchPlaceholder="Search expenses..."
        showSerialNo
        rowActions={rowActions}
        selectable={isAccountsTeam}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        isRowSelectable={isSettleable}
      />

      <AdminExpenseDrawer
        open={drawer.open}
        expense={drawerExpense}
        onClose={() => setDrawer(DRAWER_INIT)}
      />

      <BulkSettleDialog
        open={bulkSettleOpen}
        expenses={selectedExpenses}
        onClose={() => setBulkSettleOpen(false)}
        onSettled={() => { setBulkSettleOpen(false); setSelectedIds([]); }}
      />
    </Box>
  );
};
