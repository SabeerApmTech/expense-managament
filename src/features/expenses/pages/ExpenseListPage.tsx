import {
  Box, Paper, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import type { ActionItem } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { ExpenseFilters } from '../components/ExpenseFilters';
import { ExpenseDrawer } from '../components/ExpenseDrawer';
import type { DrawerMode } from '../components/ExpenseDrawer';
import { useExpenseList, useDeleteExpense } from '../hooks/useExpenses';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { Expense, ExpenseFilters as IFilters } from '../../../types/expense.types';
import type { Column } from '../../../types/common.types';

interface DrawerState {
  mode: DrawerMode;
  expenseId?: string;
}

interface DeleteTarget {
  id: string;
  expenseNo: string;
}

export const ExpenseListPage = () => {
  const [filters, setFilters] = useState<IFilters>({});
  const [drawer, setDrawer] = useState<DrawerState>({ mode: null });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const { data, isLoading, isError, refetch } = useExpenseList(filters);
  const deleteMutation = useDeleteExpense();

  const openDrawer = (mode: DrawerMode, expenseId?: string) => setDrawer({ mode, expenseId });
  const closeDrawer = () => setDrawer({ mode: null });

  const columns: Column<Expense>[] = [
    { id: 'expenseType', label: 'Type', minWidth: 110, sortable: true },
    { id: 'amount', label: 'Amount', minWidth: 110, align: 'right', sortable: true, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'fromDate', label: 'From Date', minWidth: 100, render: (v) => formatDate(String(v || '')) },
    { id: 'toDate', label: 'To Date', minWidth: 100, render: (v) => formatDate(String(v || '')) },
    { id: 'areaFrom', label: 'From', minWidth: 100 },
    { id: 'areaTo', label: 'To', minWidth: 100 },
    { id: 'initiatedBy', label: 'Initiated By', minWidth: 130 },
    { id: 'submittedOn', label: 'Submitted On', minWidth: 120, render: (v) => formatDate(String(v || '')) },
    { id: 'status', label: 'Status', minWidth: 130, render: (v) => <StatusChip status={String(v || '')} /> },
  ];

  const rowActions = (row: Expense & Record<string, unknown>): ActionItem[] => [
    {
      label: 'View',
      icon: <VisibilityIcon fontSize="small" />,
      onClick: () => openDrawer('view', String(row.id)),
    },
    ...(row.status === 'Submitted'
      ? [
          {
            label: 'Edit',
            icon: <EditIcon fontSize="small" />,
            onClick: () => openDrawer('edit', String(row.id)),
          },
          {
            label: 'Delete',
            icon: <DeleteIcon fontSize="small" />,
            color: 'error' as const,
            onClick: () => setDeleteTarget({ id: String(row.id), expenseNo: String(row.expenseNo) }),
          },
        ]
      : []),
  ];

  return (
    <Box>
      {/* Filter */}
      <Paper sx={{ mb: 2, borderRadius: 3 }}>
        <ExpenseFilters onFilter={setFilters} />
      </Paper>

      <DataTable<Expense & Record<string, unknown>>
        columns={columns as Column<Expense & Record<string, unknown>>[]}
        rows={(data?.data || []) as (Expense & Record<string, unknown>)[]}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        rowKey="id"
        title="Expense List"
        searchPlaceholder="Search expenses..."
        onAdd={() => openDrawer('add')}
        addLabel="Add Expense"
        rowActions={rowActions}
      />

      {/* Right-side Drawer for add / view / edit */}
      <ExpenseDrawer mode={drawer.mode} expenseId={drawer.expenseId} onClose={closeDrawer} />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Expense</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            {deleteTarget?.expenseNo && <strong>{deleteTarget.expenseNo}</strong>}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleteMutation.isPending}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (!deleteTarget) return;
              deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
            }}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
