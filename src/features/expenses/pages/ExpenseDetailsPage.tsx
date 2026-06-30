import {
  Box, Typography, Paper, Grid, Divider, Breadcrumbs, Link, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { StatusChip } from '../../../components/common/StatusChip';
import { ErrorState } from '../../../components/common/ErrorState';
import { Field } from '../../../components/common/Field';
import { BillAttachments } from '../../../components/common/BillAttachments';
import { BillViewerDialog } from '../../../components/common/BillViewerDialog';
import { useExpenseLookupMaps } from '../hooks/useExpenseLookupMaps';
import { formatDate, formatCurrency, formatDateTime } from '../../../utils/formatters';
import type { Expense } from '../../../types/expense.types';

export const ExpenseDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const expense = location.state?.expense as Expense | undefined;
  const { expTypeMap, payModeMap, travelModeMap } = useExpenseLookupMaps();
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  if (!expense) return <ErrorState message="Expense data not found." onRetry={() => navigate('/expenses')} />;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/expenses')}>
          My Expenses
        </Link>
        <Typography color="text.primary">Details</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Expense Details — {expense.expenseNo}</Typography>
        <StatusChip status={expense.status} />
      </Box>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Expense No" value={expense.expenseNo} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Employee" value={expense.employeeName} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Total Amount" value={formatCurrency(expense.amount)} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Initiated By" value={expense.initiatedBy} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Submitted On" value={formatDateTime(expense.submittedOn ?? '')} /></Grid>
          {expense.approvedBy && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Approved By" value={expense.approvedBy} /></Grid>
          )}
          {expense.rejectedBy && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}><Field label="Rejected By" value={expense.rejectedBy} /></Grid>
          )}
          {expense.rejectReason && (
            <Grid size={{ xs: 12 }}><Field label="Rejection Reason" value={expense.rejectReason} /></Grid>
          )}
        </Grid>
      </Paper>

      {(expense.details ?? []).map((detail, i) => (
        <Paper key={detail.id} sx={{ p: 3, mb: 2 }}>
          {(expense.details?.length ?? 0) > 1 && (
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Item #{i + 1}</Typography>
          )}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Field label="Expense Type" value={expTypeMap[detail.expenseTypeId] ?? String(detail.expenseTypeId)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Field label="Amount" value={formatCurrency(detail.amount)} />
            </Grid>
            <Grid size={{ xs: 12 }}><Divider /></Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Field label="From Date" value={formatDate(detail.fromDate)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Field label="To Date" value={formatDate(detail.toDate)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Field label="Pay Mode" value={payModeMap[detail.payModeId] ?? String(detail.payModeId)} />
            </Grid>
            {(expTypeMap[detail.expenseTypeId] ?? '').toLowerCase() === 'travel' && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Field label="Travel Mode" value={travelModeMap[detail.travelModeId] ?? String(detail.travelModeId)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Field label="From Location" value={detail.areaFrom} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Field label="To Location" value={detail.areaTo} />
                </Grid>
              </>
            )}
            {detail.description && (
              <Grid size={{ xs: 12 }}>
                <Field label="Description" value={detail.description} />
              </Grid>
            )}
            {detail.billUrl && (
              <Grid size={{ xs: 12 }}>
                <BillAttachments billUrl={detail.billUrl} onView={setViewerUrl} label="Attachments" />
              </Grid>
            )}
          </Grid>
        </Paper>
      ))}

      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/expenses')}>
          Back to List
        </Button>
      </Box>

      {viewerUrl && (
        <BillViewerDialog open={!!viewerUrl} url={viewerUrl} onClose={() => setViewerUrl(null)} />
      )}
    </Box>
  );
};
