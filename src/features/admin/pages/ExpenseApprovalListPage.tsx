import {
  Box, Paper, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, TextField, Typography, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentsIcon from '@mui/icons-material/Payments';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import type { ActionItem } from '../../../components/common/DataTable';
import { StatusChip } from '../../../components/common/StatusChip';
import { AdminExpenseFilters } from '../components/AdminExpenseFilters';
import { AdminExpenseDrawer } from '../components/AdminExpenseDrawer';
import { useAdminExpenseList, useApproveExpense, useRejectExpense, useSettleExpense } from '../hooks/useAdminExpenses';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { Expense, AdminExpenseFilters as IFilters } from '../../../types/expense.types';
import { AdminActionsCard } from '../components/AdminActionsCard';
import { AdminDashboard } from '../components/AdminDashboard';
import type { Column } from '../../../types/common.types';

interface DrawerState { open: boolean; id: string | null }
interface ApproveState { open: boolean; row: Expense | null; remarks: string }
interface RejectState { open: boolean; row: Expense | null; remarks: string; error: string }
interface SettleState { open: boolean; row: Expense | null; remarks: string; settlementFile: File | null; fileError: string }

const DRAWER_INIT: DrawerState = { open: false, id: null };
const APPROVE_INIT: ApproveState = { open: false, row: null, remarks: '' };
const REJECT_INIT: RejectState = { open: false, row: null, remarks: '', error: '' };
const SETTLE_INIT: SettleState = { open: false, row: null, remarks: '', settlementFile: null, fileError: '' };

export const ExpenseApprovalListPage = () => {
  const [filters, setFilters] = useState<IFilters>({});
  const { data, isLoading, isError, refetch } = useAdminExpenseList(filters);

  const [drawer, setDrawer] = useState<DrawerState>(DRAWER_INIT);
  const [approveState, setApproveState] = useState<ApproveState>(APPROVE_INIT);
  const [rejectState, setRejectState] = useState<RejectState>(REJECT_INIT);
  const [settleState, setSettleState] = useState<SettleState>(SETTLE_INIT);

  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const settleMutation = useSettleExpense();

  const handleApprove = () => {
    if (!approveState.row) return;
    approveMutation.mutate(
      { expenseId: Number(approveState.row.id) },
      { onSuccess: () => setApproveState(APPROVE_INIT) },
    );
  };

  const handleReject = () => {
    if (!rejectState.row) return;
    if (!rejectState.remarks.trim()) {
      setRejectState((s) => ({ ...s, error: 'Rejection reason is required' }));
      return;
    }
    rejectMutation.mutate(
      { expenseId: Number(rejectState.row.id), reason: rejectState.remarks },
      { onSuccess: () => setRejectState(REJECT_INIT) },
    );
  };

  const handleSettle = () => {
    if (!settleState.row) return;
    if (!settleState.settlementFile) {
      setSettleState((s) => ({ ...s, fileError: 'Settlement bill is required' }));
      return;
    }
    settleMutation.mutate(
      {
        expenseId: settleState.row.id,
        settlementBillFile: settleState.settlementFile,
        remarks: settleState.remarks,
      },
      { onSuccess: () => setSettleState(SETTLE_INIT) },
    );
  };

  const columns: Column<Expense>[] = [
    { id: 'employeeName', label: 'Employee', minWidth: 130, sortable: true },
    { id: 'expenseType', label: 'Type', minWidth: 110, sortable: true },
    { id: 'fromDate', label: 'From Date', minWidth: 120, render: (v) => formatDate(String(v || '')) },
    { id: 'toDate', label: 'To Date', minWidth: 120, render: (v) => formatDate(String(v || '')) },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 110,
      sortable: true,
      render: (v) => formatCurrency(Number(v || 0)),
    },
    { id: 'initiatedBy', label: 'Initiated By', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 130, render: (v) => <StatusChip status={String(v || '')} /> },
    { id: 'submittedOn', label: 'Submitted', minWidth: 110, render: (v) => formatDate(String(v || '')) },
  ];

  const rowActions = (row: Expense & Record<string, unknown>): ActionItem[] => {
    const expense = row as unknown as Expense;
    return [
      {
        label: 'View Details',
        icon: <VisibilityIcon fontSize="small" />,
        onClick: () => setDrawer({ open: true, id: String(expense.id) }),
      },
      ...(expense.status === 'Submitted'
        ? [
            {
              label: 'Approve',
              icon: <CheckCircleIcon fontSize="small" />,
              color: 'success' as const,
              onClick: () => setApproveState({ open: true, row: expense, remarks: '' }),
            },
            {
              label: 'Reject',
              icon: <CancelIcon fontSize="small" />,
              color: 'error' as const,
              onClick: () => setRejectState({ open: true, row: expense, remarks: '', error: '' }),
            },
          ]
        : []),
      ...(['Approved', 'Approval'].includes(expense.status)
        ? [
            {
              label: 'Mark as Settled',
              icon: <PaymentsIcon fontSize="small" />,
              color: 'info' as const,
              onClick: () => setSettleState({ ...SETTLE_INIT, open: true, row: expense }),
            },
          ]
        : []),
    ];
  };

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

      {/* View Details Drawer */}
      <AdminExpenseDrawer
        open={drawer.open}
        expenseId={drawer.id}
        onClose={() => setDrawer(DRAWER_INIT)}
      />

      {/* Approve Dialog */}
      <Dialog open={approveState.open} onClose={() => setApproveState(APPROVE_INIT)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Approve Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Approving <strong>{approveState.row?.expenseNo}</strong> for <strong>{approveState.row?.employeeName}</strong> —{' '}
            <strong>{approveState.row ? formatCurrency(approveState.row.amount) : ''}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApproveState(APPROVE_INIT)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            startIcon={approveMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectState.open} onClose={() => setRejectState(REJECT_INIT)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Expense</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Rejecting <strong>{rejectState.row?.expenseNo}</strong> for <strong>{rejectState.row?.employeeName}</strong>.
            Please provide a reason.
          </DialogContentText>
          <TextField
            label="Rejection Reason"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={rejectState.remarks}
            onChange={(e) => setRejectState((s) => ({ ...s, remarks: e.target.value, error: '' }))}
            error={!!rejectState.error}
            helperText={rejectState.error}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectState(REJECT_INIT)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            startIcon={rejectMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <CancelIcon />}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settle Dialog */}
      <Dialog open={settleState.open} onClose={() => setSettleState(SETTLE_INIT)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Mark as Settled</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <DialogContentText>
            Settling <strong>{settleState.row?.expenseNo}</strong> —{' '}
            <strong>{settleState.row ? formatCurrency(settleState.row.amount) : ''}</strong> for{' '}
            <strong>{settleState.row?.employeeName}</strong>.
          </DialogContentText>

          {/* Settlement bill upload */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
              Settlement Bill *
            </Typography>
            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<AttachFileIcon />}
              color={settleState.fileError ? 'error' : 'primary'}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {settleState.settlementFile ? settleState.settlementFile.name : 'Choose File'}
              <input
                type="file"
                hidden
                accept="image/*,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setSettleState((s) => ({ ...s, settlementFile: file, fileError: '' }));
                }}
              />
            </Button>
            {settleState.fileError && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                {settleState.fileError}
              </Typography>
            )}
          </Box>

          {/* Remarks */}
          <TextField
            label="Remarks"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={settleState.remarks}
            onChange={(e) => setSettleState((s) => ({ ...s, remarks: e.target.value }))}
            placeholder="Add settlement notes..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSettleState(SETTLE_INIT)}>Cancel</Button>
          <Button
            variant="contained"
            color="info"
            onClick={handleSettle}
            disabled={settleMutation.isPending}
            startIcon={settleMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <PaymentsIcon />}
          >
            Confirm Settled
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
