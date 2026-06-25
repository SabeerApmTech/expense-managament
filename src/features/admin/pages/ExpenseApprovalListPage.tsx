import { Box, Paper } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import type { ActionItem } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { AdminExpenseFilters } from '../components/AdminExpenseFilters';
import { AdminExpenseDrawer } from '../components/AdminExpenseDrawer';
import { useAdminExpenseList } from '../hooks/useAdminExpenses';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { Expense, AdminExpenseFilters as IFilters } from '../../../types/expense.types';
import { AdminActionsCard } from '../components/AdminActionsCard';
import { AdminDashboard } from '../components/AdminDashboard';
import type { Column } from '../../../types/common.types';

interface DrawerState { open: boolean; expenseId: string | number | null }

const DRAWER_INIT: DrawerState = { open: false, expenseId: null };

export const ExpenseApprovalListPage = () => {
  const [filters, setFilters] = useState<IFilters>({});
  const { data, isLoading, isError, refetch } = useAdminExpenseList(filters);
  const [drawer, setDrawer] = useState<DrawerState>(DRAWER_INIT);

  // Derive from live query data so drawer auto-updates after approve/reject
  const drawerExpense = data?.data.find(e => e.id === drawer.expenseId) ?? null;

  const columns: Column<Expense>[] = [
    { id: 'employeeName', label: 'Employee', minWidth: 130, sortable: true },
    { id: 'amount', label: 'Amount', minWidth: 110, sortable: true, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'status', label: 'Status', minWidth: 130, render: (v) => <StatusChip status={v as number} /> },
    { id: 'submittedOn', label: 'Submitted On', minWidth: 130, render: (v) => formatDate(String(v || '')) },
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
      <AdminDashboard />
      <AdminActionsCard />

      <Paper sx={{ mb: 2, borderRadius: 3 }}>
        <AdminExpenseFilters onFilter={setFilters} />
      </Paper>

      <DataTable<Expense & Record<string, unknown>>
        columns={columns as Column<Expense & Record<string, unknown>>[]}
        rows={(data?.data || []) as (Expense & Record<string, unknown>)[]}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        rowKey="id"
        title="Expense Approvals"
        searchPlaceholder="Search expenses..."
        rowActions={rowActions}
      />

      <AdminExpenseDrawer
        open={drawer.open}
        expense={drawerExpense}
        onClose={() => setDrawer(DRAWER_INIT)}
      />
    </Box>
  );
};
