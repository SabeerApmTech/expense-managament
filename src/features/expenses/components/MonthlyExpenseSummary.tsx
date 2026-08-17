import { useMemo } from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import dayjs from 'dayjs';
import { useExpenseList } from '../hooks/useExpenses';
import { useExpenseLookupMaps } from '../hooks/useExpenseLookupMaps';
import { formatCurrency } from '../../../utils/formatters';
import type { Expense } from '../../../types/expense.types';

// Fixed categorical order (never cycled) so a given type keeps its color as the list changes.
const CATEGORY_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
const OTHER_COLOR = '#898781';

const sumByType = (expenses: Expense[]): Map<number, number> => {
  const totals = new Map<number, number>();
  for (const exp of expenses) {
    if (exp.details?.length) {
      for (const d of exp.details) {
        totals.set(d.expenseTypeId, (totals.get(d.expenseTypeId) ?? 0) + Number(d.amount || 0));
      }
    } else if (exp.expenseTypeId != null) {
      totals.set(exp.expenseTypeId, (totals.get(exp.expenseTypeId) ?? 0) + Number(exp.amount || 0));
    }
  }
  return totals;
};

export const MonthlyExpenseSummary = () => {
  const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const monthEnd = dayjs().endOf('month').format('YYYY-MM-DD');
  const { data, isLoading } = useExpenseList({ fromDate: monthStart, toDate: monthEnd });
  const { expTypeMap } = useExpenseLookupMaps();

  const { breakdown, total } = useMemo(() => {
    const totals = sumByType(data?.data ?? []);
    const named = Array.from(totals.entries())
      .map(([id, amount]) => ({ id, amount, name: expTypeMap[id] ?? 'Other' }))
      .sort((a, b) => b.amount - a.amount);
    return { breakdown: named, total: named.reduce((sum, t) => sum + t.amount, 0) };
  }, [data, expTypeMap]);

  if (isLoading) {
    return (
      <Paper sx={{ mb: 2, borderRadius: 3, p: 2 }}>
        <Skeleton variant="text" width={220} height={28} />
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" width={150} height={78} sx={{ borderRadius: 2.5 }} />
          ))}
        </Box>
      </Paper>
    );
  }

  if (!breakdown.length) return null;

  const monthLabel = dayjs().format('MMMM YYYY');

  return (
    <Paper
      sx={{
        mb: 2,
        borderRadius: 3,
        p: { xs: 1.5, sm: 2 },
        background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 65%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Your Expenses in {monthLabel}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
          {formatCurrency(total)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5 }}>
        {breakdown.map((t, i) => {
          const color = CATEGORY_COLORS[i] ?? OTHER_COLOR;
          const pct = total > 0 ? Math.round((t.amount / total) * 100) : 0;
          return (
            <Box
              key={t.id}
              sx={{
                minWidth: 150,
                flexShrink: 0,
                borderRadius: 2.5,
                p: 1.5,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: 'divider',
                borderLeft: '4px solid',
                borderLeftColor: color,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.25 }} noWrap>
                {t.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }} noWrap>
                {formatCurrency(t.amount)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                <Box sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: '#eef0f7', overflow: 'hidden' }}>
                  <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {pct}%
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
