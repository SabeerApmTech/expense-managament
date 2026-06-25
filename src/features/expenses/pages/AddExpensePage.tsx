import { Box, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExpenseForm } from '../components/ExpenseForm';
import { useSaveExpense } from '../hooks/useExpenses';
import type { ExpenseFormValues, ExpenseItemFormValues } from '../schemas/expense.schema';
import type { ExpenseItemPayload } from '../../../types/expense.types';

export const AddExpensePage = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useSaveExpense();

  const handleSubmit = (values: ExpenseFormValues) => {
    const allFiles: File[] = [];
    const items: ExpenseItemPayload[] = values.items.map((item: ExpenseItemFormValues) => {
      const startIdx = allFiles.length;
      allFiles.push(...(item.billFiles ?? []));
      const fileIndices = (item.billFiles ?? []).map((_, i) => startIdx + i);
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
        FileIndices: fileIndices,
      };
    });

    mutate(
      {
        Id: 0,
        ItemsJson: JSON.stringify(items),
        BillFiles: allFiles,
      },
      { onSuccess: () => navigate('/expenses') },
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
