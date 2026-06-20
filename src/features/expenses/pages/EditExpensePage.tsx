import { Box, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ExpenseForm } from '../components/ExpenseForm';
import { useExpenseDetail, useSaveExpense } from '../hooks/useExpenses';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';
import type { ExpenseFormValues } from '../schemas/expense.schema';

export const EditExpensePage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useExpenseDetail(id);
  const { mutate, isPending } = useSaveExpense();

  if (isLoading) return <LoadingState />;
  if (isError || !data) return <ErrorState onRetry={refetch} />;

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
      { onSuccess: () => navigate('/expenses') }
    );
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/expenses')}>
          My Expenses
        </Link>
        <Typography color="text.primary">Edit Expense</Typography>
      </Breadcrumbs>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Edit Expense — {data.expenseNo}</Typography>
      <Paper sx={{ p: 3 }}>
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
          onCancel={() => navigate('/expenses')}
        />
      </Paper>
    </Box>
  );
};
