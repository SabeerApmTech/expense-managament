import { Box, Paper } from '@mui/material';
import { useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { AdminExpenseFilters } from '../components/AdminExpenseFilters';
import { useAdminExpenseList } from '../hooks/useAdminExpenses';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { Expense, AdminExpenseFilters as IFilters } from '../../../types/expense.types';
import { AdminActionsCard } from '../components/AdminActionsCard';
import { resolveStatusLabel } from '../../../constants/masterData';
import type { Column } from '../../../types/common.types';

export const ReportsPage = () => {
  const [filters, setFilters] = useState<IFilters>({});
  const { data, isLoading, isError, refetch } = useAdminExpenseList(filters);

  const columns: Column<Expense>[] = [
    { id: 'expenseNo', label: 'Expense No', minWidth: 120, sortable: true },
    { id: 'employeeName', label: 'Employee', minWidth: 130, sortable: true },
    { id: 'expenseType', label: 'Type', minWidth: 110, sortable: true },
    { id: 'fromDate', label: 'From Date', minWidth: 100, render: (v) => formatDate(String(v || '')), exportValue: (v) => formatDate(String(v || '')) },
    { id: 'toDate', label: 'To Date', minWidth: 100, render: (v) => formatDate(String(v || '')), exportValue: (v) => formatDate(String(v || '')) },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 110,
      align: 'right',
      sortable: true,
      render: (v) => formatCurrency(Number(v || 0)),
    },
    { id: 'initiatedBy', label: 'Initiated By', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 130, render: (v) => <StatusChip status={String(v || '')} />, exportValue: (v) => resolveStatusLabel(String(v || '')) },
    { id: 'submittedOn', label: 'Submitted', minWidth: 110, render: (v) => formatDate(String(v || '')), exportValue: (v) => formatDate(String(v || '')) },
  ];

  return (
    <Box>
      <AdminActionsCard />

      <Paper sx={{ mb: 2, borderRadius: 3 }}>
        <AdminExpenseFilters onFilter={setFilters} title="Report Filter" />
      </Paper>

      <DataTable<Expense & Record<string, unknown>>
        columns={columns as Column<Expense & Record<string, unknown>>[]}
        rows={(data?.data || []) as (Expense & Record<string, unknown>)[]}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        rowKey="id"
        title="Expense Reports"
        searchPlaceholder="Search expenses..."
      />
    </Box>
  );
};
