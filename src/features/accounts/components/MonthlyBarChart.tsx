import { Box, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { formatCurrency } from '../../../utils/formatters';
import type { YearlyUsageMonth } from '../../../types/accounts.types';

const MONTH_ABBR = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

interface Props {
  months: YearlyUsageMonth[];
}

// A compact 12-bar sparkline — one bar per month, height proportional to that month's
// amount relative to the year's peak month. No charting library: just flexbox + Box,
// consistent with this app's other hand-rolled bars (ExpenseUsageSummary's progress bar).
export const MonthlyBarChart = ({ months }: Props) => {
  const max = Math.max(1, ...months.map((m) => m.amount));
  const currentMonth = new Date().getMonth() + 1;

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 56 }}>
      {months.map((m) => {
        const heightPct = m.amount > 0 ? Math.max(6, Math.round((m.amount / max) * 100)) : 3;
        const isCurrent = m.monthNumber === currentMonth;
        return (
          <Tooltip key={m.monthNumber} title={`${m.monthName}: ${formatCurrency(m.amount)}`} arrow>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', cursor: 'default' }}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 14,
                  height: `${heightPct}%`,
                  borderRadius: '3px 3px 0 0',
                  bgcolor: (theme) => (m.amount > 0 ? theme.palette.primary.main : alpha(theme.palette.text.disabled, 0.25)),
                  opacity: m.amount > 0 ? (isCurrent ? 1 : 0.65) : 1,
                  transition: 'opacity 0.15s',
                  '&:hover': { opacity: 1 },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: 9, mt: 0.4, lineHeight: 1, color: isCurrent ? 'primary.main' : 'text.disabled',
                  fontWeight: isCurrent ? 700 : 500,
                }}
              >
                {MONTH_ABBR[m.monthNumber - 1] ?? ''}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};
