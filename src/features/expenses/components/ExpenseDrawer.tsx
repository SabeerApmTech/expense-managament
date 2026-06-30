import {
  Drawer, Box, Typography, IconButton, Divider, Grid, Button, Paper,
  TextField, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useMemo, useState } from 'react';
import { ExpenseForm } from './ExpenseForm';
import { Field } from '../../../components/common/Field';
import { BillAttachments } from '../../../components/common/BillAttachments';
import { BillViewerDialog } from '../../../components/common/BillViewerDialog';
import { StatusChip } from '../../../components/common/StatusChip';
import { useSaveExpense, useInitiatorApproveItem, useInitiatorRejectItem } from '../hooks/useExpenses';
import { useExpenseLookupMaps } from '../hooks/useExpenseLookupMaps';
import { useEmployees } from '../../admin/hooks/useAdminMaster';
import { getStoredAuth } from '../../../store/authStore';
import { formatDate, formatCurrency, formatDateTime } from '../../../utils/formatters';
import type { ExpenseFormValues, ExpenseItemFormValues } from '../schemas/expense.schema';
import type { Expense, ExpenseItemPayload } from '../../../types/expense.types';

export type DrawerMode = 'add' | 'view' | 'edit' | null;

interface Props {
  mode: DrawerMode;
  expense?: Expense;
  onClose: () => void;
}

const TITLE: Record<string, string> = {
  add: 'Add Expense',
  edit: 'Edit Expense',
  view: 'Expense Details',
};

type ItemConfirm = { id: number; action: 'approve' | 'reject'; reason: string };

function ViewContent({ expense }: { expense: Expense }) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<ItemConfirm | null>(null);
  const [reasonError, setReasonError] = useState('');

  const { expTypeMap, payModeMap, travelModeMap } = useExpenseLookupMaps();
  const { data: employees = [] } = useEmployees();
  const approveMutation = useInitiatorApproveItem();
  const rejectMutation = useInitiatorRejectItem();

  const currentUserId = getStoredAuth()?.id ?? '';

  const employeeMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(employees.map(e => [e.id, e.name])),
    [employees],
  );

  const handleConfirm = () => {
    if (!confirming) return;
    if (confirming.action === 'reject' && !confirming.reason.trim()) {
      setReasonError('Rejection reason is required');
      return;
    }
    const mutation = confirming.action === 'approve' ? approveMutation : rejectMutation;
    mutation.mutate(
      { expenseId: confirming.id, status: confirming.action === 'approve' ? 2 : 5, reason: confirming.reason },
      { onSuccess: () => { setConfirming(null); setReasonError(''); } },
    );
  };

  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{expense.expenseNo}</Typography>
        <StatusChip status={expense.status} />
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6 }}><Field label="Employee" value={expense.employeeName} compact /></Grid>
        <Grid size={{ xs: 6 }}><Field label="Total Amount" value={formatCurrency(expense.amount)} compact /></Grid>
        <Grid size={{ xs: 6 }}><Field label="Submitted On" value={formatDateTime(expense.submittedOn ?? '')} compact /></Grid>
{expense.rejectedBy && <Grid size={{ xs: 6 }}><Field label="Rejected By" value={expense.rejectedBy} compact /></Grid>}
        {expense.rejectReason && <Grid size={{ xs: 12 }}><Field label="Rejection Reason" value={expense.rejectReason} compact /></Grid>}
        {expense.settledBy && <Grid size={{ xs: 6 }}><Field label="Settled By" value={employeeMap[expense.settledBy] ?? expense.settledBy} compact /></Grid>}
        {expense.settledDate && <Grid size={{ xs: 6 }}><Field label="Settled On" value={formatDateTime(expense.settledDate)} compact /></Grid>}
        {expense.settlementRemarks && <Grid size={{ xs: 12 }}><Field label="Settlement Remarks" value={expense.settlementRemarks} compact /></Grid>}
        {expense.settlementBillUrl && (
          <Grid size={{ xs: 12 }}>
            <BillAttachments billUrl={expense.settlementBillUrl} onView={setViewerUrl} label="Settlement Bill" />
          </Grid>
        )}
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {(expense.details ?? []).map((detail, i) => {
        const isMyItem = detail.initiatedBy === currentUserId;
        const needsMyApproval = isMyItem && !detail.initiatedApprovedBy;
        const isConfirmingThis = confirming?.id === detail.id;

        return (
          <Paper key={detail.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            {(expense.details?.length ?? 0) > 1 && (
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Item #{i + 1}</Typography>
            )}
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}><Field label="Expense Type" value={expTypeMap[detail.expenseTypeId] ?? String(detail.expenseTypeId)} compact /></Grid>
              <Grid size={{ xs: 6 }}><Field label="Amount" value={formatCurrency(detail.amount)} compact /></Grid>
              <Grid size={{ xs: 6 }}><Field label="From Date" value={formatDate(detail.fromDate)} compact /></Grid>
              <Grid size={{ xs: 6 }}><Field label="To Date" value={formatDate(detail.toDate)} compact /></Grid>
              <Grid size={{ xs: 6 }}><Field label="Pay Mode" value={payModeMap[detail.payModeId] ?? String(detail.payModeId)} compact /></Grid>
              {(expTypeMap[detail.expenseTypeId] ?? '').toLowerCase() === 'travel' && (
                <>
                  <Grid size={{ xs: 6 }}><Field label="Travel Mode" value={travelModeMap[detail.travelModeId] ?? String(detail.travelModeId)} compact /></Grid>
                  <Grid size={{ xs: 6 }}><Field label="From Location" value={detail.areaFrom} compact /></Grid>
                  <Grid size={{ xs: 6 }}><Field label="To Location" value={detail.areaTo} compact /></Grid>
                </>
              )}
              {detail.initiatedBy && (
                <Grid size={{ xs: 6 }}><Field label="Initiated By" value={employeeMap[detail.initiatedBy] ?? detail.initiatedBy} compact /></Grid>
              )}
              {detail.initiatedApprovedBy && (
                <Grid size={{ xs: 6 }}><Field label="Initiator Approved By" value={employeeMap[detail.initiatedApprovedBy] ?? detail.initiatedApprovedBy} compact /></Grid>
              )}
              {detail.description && <Grid size={{ xs: 12 }}><Field label="Description" value={detail.description} compact /></Grid>}
              {detail.billUrl && (
                <Grid size={{ xs: 12 }}>
                  <BillAttachments billUrl={detail.billUrl} onView={setViewerUrl} />
                </Grid>
              )}
            </Grid>

            {/* Initiator approve/reject — only for items assigned to the current user */}
            {needsMyApproval && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                {isConfirmingThis && confirming?.action === 'approve' && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Confirm approval of this item ({formatCurrency(detail.amount)})?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" fullWidth onClick={() => setConfirming(null)}>Cancel</Button>
                      <Button size="small" variant="contained" color="success" fullWidth
                        onClick={handleConfirm} disabled={approveMutation.isPending}
                        startIcon={<CheckCircleIcon />}>
                        {approveMutation.isPending ? 'Approving…' : 'Confirm'}
                      </Button>
                    </Box>
                  </Box>
                )}
                {isConfirmingThis && confirming?.action === 'reject' && (
                  <Box sx={{ mb: 1 }}>
                    <TextField
                      label="Rejection Reason" fullWidth size="small" multiline rows={2} autoFocus
                      value={confirming.reason}
                      onChange={(e) => { setConfirming({ ...confirming, reason: e.target.value }); setReasonError(''); }}
                      error={!!reasonError} helperText={reasonError}
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" fullWidth onClick={() => setConfirming(null)}>Cancel</Button>
                      <Button size="small" variant="contained" color="error" fullWidth
                        onClick={handleConfirm} disabled={rejectMutation.isPending}
                        startIcon={<CancelIcon />}>
                        {rejectMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
                      </Button>
                    </Box>
                  </Box>
                )}
                {!isConfirmingThis && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" color="success" fullWidth
                      startIcon={<CheckCircleIcon />}
                      onClick={() => setConfirming({ id: detail.id, action: 'approve', reason: '' })}>
                      Approve Item
                    </Button>
                    <Button size="small" variant="contained" color="error" fullWidth
                      startIcon={<CancelIcon />}
                      onClick={() => setConfirming({ id: detail.id, action: 'reject', reason: '' })}>
                      Reject Item
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {isMyItem && detail.initiatedApprovedBy && (
              <Alert severity="success" sx={{ mt: 1.5 }} icon={<CheckCircleIcon fontSize="inherit" />}>
                You approved this item
              </Alert>
            )}
          </Paper>
        );
      })}

      {viewerUrl && (
        <BillViewerDialog open={!!viewerUrl} url={viewerUrl} onClose={() => setViewerUrl(null)} />
      )}
    </Box>
  );
}

function buildItems(values: ExpenseFormValues): { items: ExpenseItemPayload[]; allFiles: File[] } {
  const allFiles: File[] = [];
  const items: ExpenseItemPayload[] = values.items.map((item: ExpenseItemFormValues) => {
    const startIdx = allFiles.length;
    allFiles.push(...(item.billFiles ?? []));
    return {
      InitiatedBy: item.initiatedBy,
      ExpenseTypeId: Number(item.expenseTypeId),
      Description: item.description ?? '',
      FromDate: item.fromDate + 'T00:00:00',
      ToDate: item.toDate + 'T00:00:00',
      Amount: item.amount,
      PayModeId: Number(item.payModeId),
      TravelModeId: Number(item.travelModeId),
      AreaFrom: item.areaFrom,
      AreaTo: item.areaTo,
      FileIndices: (item.billFiles ?? []).map((_, i) => startIdx + i),
    };
  });
  return { items, allFiles };
}

function EditContent({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  const { mutate, isPending } = useSaveExpense();

  const handleSubmit = (values: ExpenseFormValues) => {
    const { items, allFiles } = buildItems(values);
    mutate(
      { Id: Number(expense.id), ItemsJson: JSON.stringify(items), BillFiles: allFiles },
      { onSuccess: onClose },
    );
  };

  const defaultItems = (expense.details ?? []).map(detail => ({
    initiatedBy: detail.initiatedBy ?? '',
    expenseTypeId: String(detail.expenseTypeId ?? ''),
    description: detail.description ?? '',
    fromDate: (detail.fromDate ?? '').slice(0, 10),
    toDate: (detail.toDate ?? '').slice(0, 10),
    amount: detail.amount ?? 0,
    payModeId: String(detail.payModeId ?? ''),
    travelModeId: String(detail.travelModeId ?? ''),
    areaFrom: detail.areaFrom ?? '',
    areaTo: detail.areaTo ?? '',
    billFiles: [] as File[],
  }));

  return (
    <Box sx={{ p: 2.5 }}>
      <ExpenseForm
        defaultValues={{ items: defaultItems.length > 0 ? defaultItems : undefined }}
        existingBillUrls={(expense.details ?? []).map(d => d.billUrl?.split(',')[0] ?? null)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={onClose}
      />
    </Box>
  );
}

function AddContent({ onClose }: { onClose: () => void }) {
  const { mutate, isPending } = useSaveExpense();

  const handleSubmit = (values: ExpenseFormValues) => {
    const { items, allFiles } = buildItems(values);
    mutate(
      { Id: 0, ItemsJson: JSON.stringify(items), BillFiles: allFiles },
      { onSuccess: onClose },
    );
  };

  return (
    <Box sx={{ p: 2.5 }}>
      <ExpenseForm onSubmit={handleSubmit} isSubmitting={isPending} onCancel={onClose} />
    </Box>
  );
}

export const ExpenseDrawer = ({ mode, expense, onClose }: Props) => (
  <Drawer
    anchor="right"
    open={mode !== null}
    onClose={onClose}
    sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: 580 }, display: 'flex', flexDirection: 'column' } }}
  >
    <Box sx={{
      display: 'flex', alignItems: 'center', px: 2.5, py: 1.75,
      position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, flexShrink: 0,
    }}>
      <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
        {mode ? TITLE[mode] : ''}
      </Typography>
      <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
    <Divider sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      {mode === 'view' && expense && <ViewContent expense={expense} />}
      {mode === 'edit' && expense && <EditContent expense={expense} onClose={onClose} />}
      {mode === 'add' && <AddContent onClose={onClose} />}
    </Box>
  </Drawer>
);
