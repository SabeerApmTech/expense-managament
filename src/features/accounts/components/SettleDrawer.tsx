import {
  Drawer, Box, Typography, IconButton, Divider, Paper, CircularProgress,
  Checkbox, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState } from 'react';
import { Field } from '../../../components/common/Field';
import { FileUpload } from '../../../components/common/FileUpload';
import { BillViewerDialog } from '../../../components/common/BillViewerDialog';
import { useExpenseSettlementDetails, useSettleExpense } from '../hooks/useAccounts';
import { resolveSettlementBillUrl } from '../../../api/accounts.api';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import type { SettleExpenseResult } from '../../../types/accounts.types';

interface Props {
  open: boolean;
  expenseCode?: string;
  onClose: () => void;
}

function SettleDrawerContent({ expenseCode }: { expenseCode: string }) {
  const { user } = useAuthContext();
  const { data: expense, isLoading } = useExpenseSettlementDetails(expenseCode, user?.empId);
  const settleMutation = useSettleExpense();

  const [selectedIds, setSelectedIds] = useState<number[] | null>(null);
  const [bill, setBill] = useState<File | null>(null);
  const [billError, setBillError] = useState('');
  const [result, setResult] = useState<SettleExpenseResult | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Until the accountant touches a checkbox, default to every unsettled item.
  const defaultSelectedIds = (expense?.details ?? []).filter((i) => !i.isSettled).map((i) => i.expenseDetailId);
  const effectiveSelectedIds = selectedIds ?? defaultSelectedIds;
  // Only meaningful once a settle has actually succeeded — falls back to the ids that
  // were submitted if the response doesn't echo back settledExpenseItems.
  const justSettledIds = new Set(
    result ? (result.settledExpenseItems?.map((i) => i.expenseDetailId) ?? effectiveSelectedIds) : []
  );

  const toggleItem = (id: number, checked: boolean) => {
    setSelectedIds((current) => {
      const base = current ?? defaultSelectedIds;
      return checked ? [...base, id] : base.filter((i) => i !== id);
    });
  };

  const selectedAmount = (expense?.details ?? [])
    .filter((i) => effectiveSelectedIds.includes(i.expenseDetailId))
    .reduce((sum, i) => sum + i.amount, 0);

  const handleSettleClick = () => {
    if (effectiveSelectedIds.length === 0) return;
    if (!bill) { setBillError('Please upload a settlement bill'); return; }
    setConfirmOpen(true);
  };

  const handleConfirmSettle = () => {
    if (!user || !expense || !bill) return;

    const formData = new FormData();
    formData.append('AccountantEmpId', user.empId);
    effectiveSelectedIds.forEach((id) => formData.append('ExpenseDetailIds', String(id)));
    formData.append('SettlementBill', bill);

    settleMutation.mutate(formData, {
      onSuccess: (res) => { setResult(res.data); setConfirmOpen(false); },
    });
  };

  if (isLoading || !expense) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;
  }

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Field label="Expense Code" value={expense.expenseCode} compact />
          <Field label="Total Amount" value={formatCurrency(expense.totalExpenseAmount)} compact />
          <Field label="Approved Amount" value={formatCurrency(expense.approvedAmount)} compact />
          <Field label="Paid Amount" value={formatCurrency(expense.paidAmount)} compact />
          <Field label="Remaining Approved" value={formatCurrency(expense.remainingApprovedAmount)} compact />
          <Field label="Remaining Total" value={formatCurrency(expense.remainingTotalAmount)} compact />
        </Box>
      </Paper>

      {result && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settled {formatCurrency(result.settlementAmount ?? selectedAmount)}
          {result.settlementBill?.createdAt && <> on {formatDateTime(result.settlementBill.createdAt)}</>}.{' '}
          {result.settlementBill?.settlementBillPath && (
            <Button
              size="small"
              onClick={() => setViewerUrl(resolveSettlementBillUrl(result.settlementBill.settlementBillPath))}
            >
              View Bill
            </Button>
          )}
        </Alert>
      )}

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Expense Items</Typography>
      {expense.details.map((item) => {
        // Trust this session's own settle result immediately — don't wait on the
        // details query to refetch before locking the item down as settled.
        const isSettled = item.isSettled || justSettledIds.has(item.expenseDetailId);
        const checked = isSettled || effectiveSelectedIds.includes(item.expenseDetailId);
        return (
          <Paper
            key={item.expenseDetailId}
            variant="outlined"
            onClick={() => !isSettled && toggleItem(item.expenseDetailId, !checked)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              px: 1.5, py: 1.25, mb: 1.25, borderRadius: 2,
              cursor: isSettled ? 'default' : 'pointer',
              opacity: isSettled ? 0.65 : 1,
              borderColor: checked && !isSettled ? 'primary.main' : 'divider',
              bgcolor: checked && !isSettled ? '#f0f4ff' : 'background.paper',
              transition: 'border-color 0.15s, background-color 0.15s',
              '&:hover': isSettled ? undefined : { borderColor: 'primary.main' },
            }}
          >
            {isSettled ? (
              <CheckCircleIcon fontSize="small" color="success" />
            ) : (
              <Checkbox
                size="small"
                checked={checked}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => toggleItem(item.expenseDetailId, e.target.checked)}
                sx={{ p: 0 }}
              />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.expenseTypeName}</Typography>
              {isSettled && (
                <Typography variant="caption" color="success.main">Already settled</Typography>
              )}
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatCurrency(item.amount)}</Typography>
          </Paper>
        );
      })}

      {!result && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Selected for settlement</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatCurrency(selectedAmount)}</Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <FileUpload
              value={bill}
              onChange={(f) => { setBill(f); setBillError(''); }}
              label="Upload Settlement Bill"
              error={billError}
            />
          </Box>
          <Button
            variant="contained"
            fullWidth
            disabled={effectiveSelectedIds.length === 0 || settleMutation.isPending}
            onClick={handleSettleClick}
          >
            {`Settle ${effectiveSelectedIds.length} Item(s)`}
          </Button>
        </>
      )}

      {viewerUrl && <BillViewerDialog open={!!viewerUrl} url={viewerUrl} onClose={() => setViewerUrl(null)} />}

      <Dialog open={confirmOpen} onClose={() => !settleMutation.isPending && setConfirmOpen(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Settlement</DialogTitle>
        <DialogContent>
          <Typography>
            Settle {effectiveSelectedIds.length} item(s) totaling <strong>{formatCurrency(selectedAmount)}</strong>{' '}
            for <strong>{expense.expenseCode}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={settleMutation.isPending}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSettle}
            disabled={settleMutation.isPending}
            startIcon={settleMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {settleMutation.isPending ? 'Settling…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export const SettleDrawer = ({ open, expenseCode, onClose }: Props) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: 600 }, display: 'flex', flexDirection: 'column' } }}
  >
    <Box sx={{
      display: 'flex', alignItems: 'center', px: 2.5, py: 1.75,
      position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, flexShrink: 0,
    }}>
      <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Settle Expense</Typography>
      <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
    <Divider sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
      {/* Keying by expenseCode remounts fresh state whenever a different expense is opened. */}
      {expenseCode && <SettleDrawerContent key={expenseCode} expenseCode={expenseCode} />}
    </Box>
  </Drawer>
);
