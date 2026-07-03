import { Box, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ExpenseForm } from '../components/ExpenseForm';
import { useSaveExpense } from '../hooks/useExpenses';
import { ErrorState } from '../../../components/common/ErrorState';
import type { ExpenseFormValues, ExpenseItemFormValues } from '../schemas/expense.schema';
import type { Expense, ExpenseItemPayload } from '../../../types/expense.types';

export const EditExpensePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const expense = location.state?.expense as Expense | undefined;
  const { mutate, isPending } = useSaveExpense();

  if (!expense) return <ErrorState message="Expense data not found." onRetry={() => navigate('/expenses')} />;

  const handleSubmit = (values: ExpenseFormValues) => {
    const allFiles: File[] = [];
    const items: ExpenseItemPayload[] = values.items.map((item: ExpenseItemFormValues) => {
      const startIdx = allFiles.length;
      allFiles.push(...(item.billFiles ?? []));
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
        FileIndices: (item.billFiles ?? []).map((_, i) => startIdx + i),
      };
    });
    mutate(
      { Id: Number(expense.id), ItemsJson: JSON.stringify(items), BillFiles: allFiles },
      { onSuccess: () => navigate('/expenses') },
    );
  };

  const defaultItems = (expense.details ?? []).map(detail => ({
    initiatedBy: detail.initiatedBy ?? '',
    expenseTypeId: String(detail.expenseTypeId ?? ''),
    description: detail.description ?? '',
    fromDate: (detail.fromDate ?? '').slice(0, 10),
    toDate: (detail.toDate ?? '').slice(0, 10),
    amount: detail.amount ?? 0,
    payModeId: String(detail.payModeId ?? ''),
    travelModeId: String(detail.travelModeId ?? ''),
    areaFrom: detail.areaFrom ?? '',
    areaTo: detail.areaTo ?? '',
    billFiles: [] as File[],
  }));

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/expenses')}>
          My Expenses
        </Link>
        <Typography color="text.primary">Edit Expense</Typography>
      </Breadcrumbs>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Edit Expense — {expense.expenseNo}</Typography>
      <Paper sx={{ p: 3 }}>
        <ExpenseForm
          defaultValues={{
            items: defaultItems.length > 0 ? defaultItems : undefined,
          }}
          existingBillUrls={(expense.details ?? []).map(d => d.billUrl?.split(',')[0] ?? null)}
          excludeExpenseId={expense.id}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          onCancel={() => navigate('/expenses')}
        />
      </Paper>
    </Box>
  );
};
