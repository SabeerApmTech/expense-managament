import { Paper, Box, Typography } from '@mui/material';
import { MonthlyBarChart } from './MonthlyBarChart';
import { formatCurrency } from '../../../utils/formatters';
import type { YearlyUsageExpenseType } from '../../../types/accounts.types';

export const ExpenseTypeYearCard = ({ expenseType }: { expenseType: YearlyUsageExpenseType }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2, borderRadius: 2.5, transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 2 },
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
        {expenseType.expenseTypeName}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap' }}>
        {formatCurrency(expenseType.totalYearlyAmount)}
      </Typography>
    </Box>
    <MonthlyBarChart months={expenseType.monthlyUsage} />
  </Paper>
);
