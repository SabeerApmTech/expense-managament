import {
  Drawer, Box, Typography, IconButton, Divider, Grid, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ExpenseForm } from './ExpenseForm';
import { StatusChip } from '../../../components/common/StatusChip';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';
import { useExpenseDetail, useSaveExpense } from '../hooks/useExpenses';
import { formatDate, formatCurrency, formatDateTime } from '../../../utils/formatters';
import type { ExpenseFormValues } from '../schemas/expense.schema';

export type DrawerMode = 'add' | 'view' | 'edit' | null;

interface Props {
  mode: DrawerMode;
  expenseId?: string;
  onClose: () => void;
}

const TITLE: Record<string, string> = {
  add: 'Add Expense',
  edit: 'Edit Expense',
  view: 'Expense Details',
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontWeight: 600, letterSpacing: 0.5, display: 'block', textTransform: 'uppercase' }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 500 }}>{value || '-'}</Typography>
  </Box>
);

function ViewContent({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useExpenseDetail(id);
  if (isLoading) return <Box sx={{ p: 3 }}><LoadingState /></Box>;
  if (isError || !data) return <Box sx={{ p: 3 }}><ErrorState onRetry={refetch} /></Box>;

  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{data.expenseNo}</Typography>
        <StatusChip status={data.status} />
      </Box>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 6 }}><Field label="Expense Type" value={data.expenseType} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="Amount" value={formatCurrency(data.amount)} /></Grid>
        <Grid size={{ xs: 12 }}><Field label="Description" value={data.description} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="From Date" value={formatDate(data.fromDate)} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="To Date" value={formatDate(data.toDate)} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="Pay Mode" value={data.payMode} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="Travel Mode" value={data.travelMode} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="From Location" value={data.areaFrom} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="To Location" value={data.areaTo} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="Initiated By" value={data.initiatedBy ?? data.createdBy} /></Grid>
        <Grid size={{ xs: 12 }}><Field label="Submitted On" value={formatDateTime(data.submittedOn ?? data.createdDate ?? '')} /></Grid>
        {data.rejectReason && (
          <Grid size={{ xs: 12 }}><Field label="Rejection Reason" value={data.rejectReason} /></Grid>
        )}
        {data.billUrl && (
          <Grid size={{ xs: 12 }}>
            <Button variant="outlined" size="small" href={data.billUrl} target="_blank" rel="noreferrer">
              View Attachment
            </Button>
          </Grid>
        )}
        {data.settlementBillUrl && (
          <Grid size={{ xs: 12 }}>
            <Button variant="outlined" size="small" color="success" href={data.settlementBillUrl} target="_blank" rel="noreferrer">
              View Settlement Proof
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

function EditContent({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading, isError, refetch } = useExpenseDetail(id);
  const { mutate, isPending } = useSaveExpense();

  if (isLoading) return <Box sx={{ p: 3 }}><LoadingState /></Box>;
  if (isError || !data) return <Box sx={{ p: 3 }}><ErrorState onRetry={refetch} /></Box>;

  const handleSubmit = (values: ExpenseFormValues, attachment: File | null) => {
    mutate(
      {
        Id: Number(data.id),
        ExpenseTypeId: Number(values.expenseTypeId),
        Description: values.description,
        FromDate: values.fromDate,
        ToDate: values.toDate,
        Amount: values.amount,
        PayModeId: Number(values.payModeId),
        TravelModeId: Number(values.travelModeId),
        AreaFrom: values.fromLocation,
        AreaTo: values.toLocation,
        InitiatedBy: values.initiatedBy,
        BillFile: attachment ?? undefined,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Box sx={{ p: 2.5 }}>
      <ExpenseForm
        defaultValues={{
          expenseTypeId: String(data.expenseTypeId ?? ''),
          description: data.description,
          fromDate: data.fromDate,
          toDate: data.toDate,
          amount: data.amount,
          payModeId: String(data.payModeId ?? ''),
          travelModeId: String(data.travelModeId ?? ''),
          fromLocation: data.areaFrom,
          toLocation: data.areaTo,
          initiatedBy: data.initiatedBy ?? data.createdBy ?? '',
        }}
        existingBillUrl={data.billUrl}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={onClose}
      />
    </Box>
  );
}

function AddContent({ onClose }: { onClose: () => void }) {
  const { mutate, isPending } = useSaveExpense();

  const handleSubmit = (values: ExpenseFormValues, attachment: File | null) => {
    mutate(
      {
        Id: 0,
        ExpenseTypeId: Number(values.expenseTypeId),
        Description: values.description,
        FromDate: values.fromDate,
        ToDate: values.toDate,
        Amount: values.amount,
        PayModeId: Number(values.payModeId),
        TravelModeId: Number(values.travelModeId),
        AreaFrom: values.fromLocation,
        AreaTo: values.toLocation,
        InitiatedBy: values.initiatedBy,
        BillFile: attachment ?? undefined,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Box sx={{ p: 2.5 }}>
      <ExpenseForm onSubmit={handleSubmit} isSubmitting={isPending} onCancel={onClose} />
    </Box>
  );
}

export const ExpenseDrawer = ({ mode, expenseId, onClose }: Props) => (
  <Drawer
    anchor="right"
    open={mode !== null}
    onClose={onClose}
    sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: 580 }, display: 'flex', flexDirection: 'column' } }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2.5,
        py: 1.75,
        position: 'sticky',
        top: 0,
        bgcolor: 'background.paper',
        zIndex: 1,
        flexShrink: 0,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
        {mode ? TITLE[mode] : ''}
      </Typography>
      <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
    <Divider sx={{ flexShrink: 0 }} />

    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      {mode === 'view' && expenseId && <ViewContent id={expenseId} />}
      {mode === 'edit' && expenseId && <EditContent id={expenseId} onClose={onClose} />}
      {mode === 'add' && <AddContent onClose={onClose} />}
    </Box>
  </Drawer>
);
