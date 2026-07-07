import {
  Box, Typography, Paper, Grid, Divider, Breadcrumbs, Link, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminExpenseDetail, useApproveExpense, useRejectExpense } from '../hooks/useAdminExpenses';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';
import { StatusChip } from '../../../components/common/StatusChip';
import { Field } from '../../../components/common/Field';
import { useAuthContext } from '../../../store/authStore';
import { formatDate, formatCurrency, formatDateTime } from '../../../utils/formatters';
import { isSubmitted } from '../../../constants/masterData';

export const AdminExpenseDetailsPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuthContext();
  const isAdminOrSuperAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const { data, isLoading, isError, refetch } = useAdminExpenseDetail(id);
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const [rejectDialog, setRejectDialog] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState('');

  const handleApprove = () => {
    approveMutation.mutate({ expenseId: Number(id), status: 3 }, { onSuccess: () => navigate('/admin/approvals') });
  };

  const handleReject = () => {
    if (!remarks.trim()) { setRemarksError('Remarks are required'); return; }
    rejectMutation.mutate({ expenseId: Number(id), reason: remarks }, { onSuccess: () => { setRejectDialog(false); navigate('/admin/approvals'); } });
  };

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  const isPending = isAdminOrSuperAdmin && isSubmitted(data.status);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/approvals')}>
          Expense Approvals
        </Link>
        <Typography color="text.primary">Details</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Expense Details — {data.expenseNo}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <StatusChip status={data.status} />
          {isPending && (
            <>
              <Button
                variant="contained" color="success"
                startIcon={approveMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
                onClick={handleApprove} disabled={approveMutation.isPending}
              >
                Approve
              </Button>
              <Button variant="contained" color="error" startIcon={<CancelIcon />} onClick={() => setRejectDialog(true)}>
                Reject
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Expense No" value={data.expenseNo} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Employee" value={data.employeeName} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Expense Type" value={data.expenseType} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Amount" value={formatCurrency(data.amount)} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Pay Mode" value={data.payMode} /></Grid>
          {(data.expenseType ?? '').toLowerCase() === 'travel' && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Travel Mode" value={data.travelMode} /></Grid>
          )}
          <Grid size={{ xs: 12 }}><Divider /></Grid>
          <Grid size={{ xs: 12 }}><Field label="Description" value={data.description} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="From Date" value={formatDate(data.fromDate)} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="To Date" value={formatDate(data.toDate)} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Submitted On" value={formatDateTime(data.submittedOn ?? data.createdDate ?? '')} /></Grid>
          {(data.expenseType ?? '').toLowerCase() === 'travel' && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="From Location" value={data.areaFrom} /></Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="To Location" value={data.areaTo} /></Grid>
            </>
          )}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Initiated By" value={data.initiatedBy ?? data.createdBy} /></Grid>
          {data.rejectReason && (
            <Grid size={{ xs: 12 }}><Field label="Rejection Reason" value={data.rejectReason} /></Grid>
          )}
          {data.billUrl && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary"
                sx={{ fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                Attachment
              </Typography>
              <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" href={data.billUrl} target="_blank" rel="noreferrer">
                  View Attachment
                </Button>
                <Button variant="outlined" size="small" href={data.billUrl} download>
                  Download
                </Button>
              </Box>
            </Grid>
          )}
          {data.settlementBillUrl && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary"
                sx={{ fontWeight: 600, textTransform: 'uppercase', display: 'block' }}>
                Settlement Proof
              </Typography>
              <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" color="success" href={data.settlementBillUrl} target="_blank" rel="noreferrer">
                  View Settlement Proof
                </Button>
                <Button variant="outlined" size="small" color="success" href={data.settlementBillUrl} download>
                  Download
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/approvals')}>
            Back to List
          </Button>
        </Box>
      </Paper>

      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Expense</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Remarks" multiline rows={4} fullWidth
            value={remarks}
            onChange={(e) => { setRemarks(e.target.value); setRemarksError(''); }}
            error={!!remarksError} helperText={remarksError}
            autoFocus sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={rejectMutation.isPending}>
            {rejectMutation.isPending ? <CircularProgress size={18} color="inherit" /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
