import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  Button, TextField, List, ListItem, ListItemText, Divider, Alert,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useState } from 'react';
import { useSettleExpensesBulk } from '../hooks/useAdminExpenses';
import { formatCurrency } from '../../../utils/formatters';
import type { Expense } from '../../../types/expense.types';

interface Props {
  open: boolean;
  expenses: Expense[];
  onClose: () => void;
  onSettled: () => void;
}

export const BulkSettleDialog = ({ open, expenses, onClose, onSettled }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [remarks, setRemarks] = useState('');

  const settleMutation = useSettleExpensesBulk();

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const employeeIds = new Set(expenses.map((e) => e.employeeId));
  const mixedEmployees = employeeIds.size > 1;

  const reset = () => {
    setFile(null);
    setFileError('');
    setRemarks('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!file) { setFileError('Settlement bill is required'); return; }
    settleMutation.mutate(
      { expenseIds: expenses.map((e) => e.id), settlementBillFile: file, remarks },
      {
        onSuccess: () => {
          reset();
          onSettled();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Settle {expenses.length} Expense{expenses.length > 1 ? 's' : ''}</DialogTitle>
      <DialogContent dividers>
        {mixedEmployees && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Selected expenses belong to more than one employee. A settlement bill can only cover expenses for a single employee.
          </Alert>
        )}

        <List dense disablePadding sx={{ maxHeight: 200, overflowY: 'auto', mb: 1.5 }}>
          {expenses.map((e) => (
            <ListItem key={String(e.id)} disableGutters sx={{ py: 0.5 }}>
              <ListItemText
                primary={e.expenseNo}
                secondary={e.employeeName}
                slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 600 } }, secondary: { sx: { fontSize: 12 } } }}
              />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(e.amount)}</Typography>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(totalAmount)}</Typography>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
            Settlement Bill *
          </Typography>
          <Button component="label" variant="outlined" size="small"
            startIcon={<AttachFileIcon />} color={fileError ? 'error' : 'primary'}>
            {file ? file.name : 'Choose File'}
            <input type="file" hidden accept="image/*,application/pdf"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setFileError(''); }}
            />
          </Button>
          {fileError && (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>{fileError}</Typography>
          )}
        </Box>

        <TextField label="Remarks" size="small" fullWidth multiline rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={handleClose} size="small">Cancel</Button>
        <Button variant="contained" color="info" size="small"
          onClick={handleSubmit} disabled={settleMutation.isPending || mixedEmployees}
          startIcon={settleMutation.isPending ? undefined : <PaymentsIcon />}>
          {settleMutation.isPending ? 'Settling…' : 'Confirm Settle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
