import {
  Box, Typography, Paper, Grid, Divider, Breadcrumbs, Link, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useExpenseDetail } from '../hooks/useExpenses';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';
import { StatusChip } from '../../../components/common/StatusChip';
import { formatDate, formatCurrency, formatDateTime } from '../../../utils/formatters';

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}
    >
      {label}
    </Typography>
    <Typography variant="body1" sx={{ mt: 0.25 }}>{value || '-'}</Typography>
  </Box>
);

export const ExpenseDetailsPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useExpenseDetail(id);

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/expenses')}>
          My Expenses
        </Link>
        <Typography color="text.primary">Details</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Expense Details — {data.expenseNo}</Typography>
        <StatusChip status={data.status} />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="Expense No" value={data.expenseNo} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="Expense Type" value={data.expenseType} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="Amount" value={formatCurrency(data.amount)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Field label="Description" value={data.description} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="From Date" value={formatDate(data.fromDate)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="To Date" value={formatDate(data.toDate)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="Pay Mode" value={data.payMode} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="Travel Mode" value={data.travelMode} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="From Location" value={data.areaFrom} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="To Location" value={data.areaTo} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="Initiated By" value={data.initiatedBy ?? data.createdBy} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Field label="Submitted On" value={formatDateTime(data.submittedOn ?? data.createdDate ?? '')} />
          </Grid>
          {data.rejectReason && (
            <Grid size={{ xs: 12 }}>
              <Field label="Rejection Reason" value={data.rejectReason} />
            </Grid>
          )}
          {data.billUrl && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, textTransform: 'uppercase', display: 'block' }}
              >
                Attachment
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Button variant="outlined" size="small" href={data.billUrl} target="_blank" rel="noreferrer">
                  View Attachment
                </Button>
              </Box>
            </Grid>
          )}
          {data.settlementBillUrl && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, textTransform: 'uppercase', display: 'block' }}
              >
                Settlement Proof
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Button variant="outlined" size="small" color="success" href={data.settlementBillUrl} target="_blank" rel="noreferrer">
                  View Settlement Proof
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/expenses')}>
            Back to List
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
