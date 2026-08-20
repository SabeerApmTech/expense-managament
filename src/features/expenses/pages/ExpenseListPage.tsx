import { Box } from '@mui/material';
import { useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import { ExpenseDrawer } from '../components/ExpenseDrawer';
import { ExpenseUsageSummary } from '../components/ExpenseUsageSummary';
import type { DrawerMode } from '../components/ExpenseDrawer';
import { useExpenseList } from '../hooks/useExpenses';
import { useAuthContext } from '../../../store/authStore';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { ExpenseSummary } from '../../../types/expense.types';
import type { Column } from '../../../types/common.types';

interface DrawerState {
  mode: DrawerMode;
  expenseId?: number;
}

export const ExpenseListPage = () => {
  const { user } = useAuthContext();
  const empId = user?.empId ?? '';
  const [drawer, setDrawer] = useState<DrawerState>({ mode: null });

  const { data = [], isLoading, isError, refetch } = useExpenseList(empId);

  const openDrawer = (mode: DrawerMode, expenseId?: number) => setDrawer({ mode, expenseId });
  const closeDrawer = () => setDrawer({ mode: null });

  const columns: Column<ExpenseSummary>[] = [
    { id: 'expenseCode', label: 'Expense Code', minWidth: 140, sortable: true },
    { id: 'totalAmount', label: 'Total Amount', minWidth: 120, sortable: true, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'submittedOn', label: 'Submitted On', minWidth: 140, render: (v) => formatDate(String(v || '')), exportValue: (v) => formatDate(String(v || '')) },
    { id: 'pendingCount', label: 'Pending', minWidth: 90, align: 'center' },
    { id: 'approvedCount', label: 'Approved', minWidth: 90, align: 'center' },
    { id: 'rejectedCount', label: 'Rejected', minWidth: 90, align: 'center' },
  ];

  return (
    <Box>
      {empId && <ExpenseUsageSummary empId={empId} />}
      <DataTable<ExpenseSummary & Record<string, unknown>>
        columns={columns as Column<ExpenseSummary & Record<string, unknown>>[]}
        rows={data as (ExpenseSummary & Record<string, unknown>)[]}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        rowKey="expenseId"
        title="My Expenses"
        searchPlaceholder="Search expenses..."
        showSerialNo
        onAdd={() => openDrawer('add')}
        addLabel="Add Expense"
        onRowClick={(row) => openDrawer('view', row.expenseId)}
      />

      <ExpenseDrawer mode={drawer.mode} expenseId={drawer.expenseId} onClose={closeDrawer} />
    </Box>
  );
};
