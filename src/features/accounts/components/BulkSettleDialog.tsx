import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import { FileUpload } from '../../../components/common/FileUpload';
import { useSettleExpense } from '../hooks/useAccounts';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';
import type { PendingSettlement } from '../../../types/accounts.types';

interface Props {
  open: boolean;
  expenses: PendingSettlement[];
  onClose: () => void;
  onSettled: () => void;
}

export const BulkSettleDialog = ({ open, expenses, onClose, onSettled }: Props) => {
  const { user } = useAuthContext();
  const settleMutation = useSettleExpense();
  const [bill, setBill] = useState<File | null>(null);
  const [billError, setBillError] = useState('');

  const totalAmount = expenses.reduce((sum, e) => sum + e.remainingApprovedAmount, 0);

  const handleClose = () => {
    setBill(null);
    setBillError('');
    onClose();
  };

  const handleSettle = () => {
    if (!user) return;
    if (!bill) { setBillError('Please upload a settlement bill'); return; }

    const formData = new FormData();
    formData.append('AccountantEmpId', user.empId);
    expenses.forEach((e) => formData.append('ExpenseIds', String(e.expenseId)));
    expenses.forEach((e) => {
      e.details.filter((i) => !i.isSettled).forEach((i) => formData.append('ExpenseDetailIds', String(i.expenseDetailId)));
    });
    formData.append('SettlementBill', bill);

    settleMutation.mutate(formData, {
      onSuccess: () => { handleClose(); onSettled(); },
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Settle {expenses.length} Expense{expenses.length !== 1 ? 's' : ''}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {expenses.map((e) => (
            <Box key={e.expenseId} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
              <Typography variant="body2">{e.expenseCode}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(e.remainingApprovedAmount)}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, mb: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">Total</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatCurrency(totalAmount)}</Typography>
        </Box>
        <FileUpload
          value={bill}
          onChange={(f) => { setBill(f); setBillError(''); }}
          label="Upload Settlement Bill"
          error={billError}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={settleMutation.isPending}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSettle}
          disabled={settleMutation.isPending}
          startIcon={settleMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {settleMutation.isPending ? 'Settling…' : 'Settle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
