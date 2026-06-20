import { Box, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExpenseForm } from '../components/ExpenseForm';
import { useSaveExpense } from '../hooks/useExpenses';
import type { ExpenseFormValues } from '../schemas/expense.schema';

export const AddExpensePage = () => {
  const navigate = useNavigate();
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
      { onSuccess: () => navigate('/expenses') }
    );
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/expenses')}>
          My Expenses
        </Link>
        <Typography color="text.primary">Add Expense</Typography>
      </Breadcrumbs>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Add Expense</Typography>
      <Paper sx={{ p: 3 }}>
        <ExpenseForm onSubmit={handleSubmit} isSubmitting={isPending} onCancel={() => navigate('/expenses')} />
      </Paper>
    </Box>
  );
};
