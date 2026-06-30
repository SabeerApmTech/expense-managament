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
import { isSubmitted, resolveStatusLabel } from '../../../constants/masterData';
import { getStoredAuth } from '../../../store/authStore';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { Expense, ExpenseFilters as IFilters } from '../../../types/expense.types';
import type { Column } from '../../../types/common.types';

interface DrawerState {
  mode: DrawerMode;
  expenseId?: string | number;
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

  // Always derive from live query data so drawer auto-updates after mutations
  const drawerExpense = data?.data.find(e => e.id === drawer.expenseId);

  const openDrawer = (mode: DrawerMode, expense?: Expense) => setDrawer({ mode, expenseId: expense?.id });
  const closeDrawer = () => setDrawer({ mode: null });

  const columns: Column<Expense>[] = [
    { id: 'expenseNo', label: 'Expense No', minWidth: 130, sortable: true },
    { id: 'amount', label: 'Total Amount', minWidth: 120, sortable: true, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'submittedOn', label: 'Submitted On', minWidth: 130, render: (v) => formatDate(String(v || '')), exportValue: (v) => formatDate(String(v || '')) },
    { id: 'status', label: 'Status', minWidth: 140, render: (v) => <StatusChip status={v as number} />, exportValue: (v) => resolveStatusLabel(String(v || '')) },
  ];

  const rowActions = (row: Expense & Record<string, unknown>): ActionItem[] => {
    const currentUserId = getStoredAuth()?.id ?? '';
    const isOwner = row.employeeId === currentUserId;
    return [
      {
        label: 'View',
        icon: <VisibilityIcon fontSize="small" />,
        onClick: () => openDrawer('view', row as Expense),
      },
      ...(isOwner && isSubmitted(row.status)
        ? [
            {
              label: 'Edit',
              icon: <EditIcon fontSize="small" />,
              onClick: () => openDrawer('edit', row as Expense),
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
  };

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
      <ExpenseDrawer mode={drawer.mode} expense={drawerExpense} onClose={closeDrawer} />

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
