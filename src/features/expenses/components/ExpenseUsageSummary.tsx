import { Box, Paper, Typography, LinearProgress, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import HomeIcon from '@mui/icons-material/Home';
import { useExpenseTypeUsage } from '../hooks/useExpenseTypeUsage';
import { formatCurrency } from '../../../utils/formatters';
import type { ExpenseCategory } from '../../../types/expenseType.types';

interface Props {
  empId: string;
  category: ExpenseCategory;
}

export const ExpenseUsageSummary = ({ empId, category }: Props) => {
  const { data: allUsage = [] } = useExpenseTypeUsage(empId);
  const usage = allUsage.filter((t) => t.expenseCategory === category);

  if (usage.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        This Month's Usage
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        {usage.map((item) => {
          const spent = item.settledAmount;
          const remaining = item.limitAmount - spent;
          const pct = item.limitAmount > 0 ? Math.min(100, (spent / item.limitAmount) * 100) : 0;
          const exhausted = remaining <= 0;
          const nearLimit = !exhausted && pct >= 80;
          const status: 'success' | 'warning' | 'error' = exhausted ? 'error' : nearLimit ? 'warning' : 'success';
          const isOffice = item.expenseCategory === 'Office';
          const categoryColor = isOffice ? 'info.main' : 'secondary.main';

          return (
            <Paper
              key={item.userExpenseTypeId}
              variant="outlined"
              sx={{
                p: 1.25,
                borderRadius: 2,
                borderLeft: '3px solid',
                borderLeftColor: `${status}.main`,
                transition: 'box-shadow .2s ease',
                '&:hover': { boxShadow: 3 },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: (theme) => alpha(theme.palette[isOffice ? 'info' : 'secondary'].main, 0.12),
                      color: categoryColor,
                    }}
                  >
                    {isOffice ? <BusinessCenterIcon sx={{ fontSize: 13 }} /> : <HomeIcon sx={{ fontSize: 13 }} />}
                  </Box>
                  <Typography
                    variant="body2"
                    title={item.expenseTypeName}
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {item.expenseTypeName}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={item.expenseCategory}
                  sx={{
                    height: 18, fontSize: 10, fontWeight: 700, flexShrink: 0,
                    bgcolor: (theme) => alpha(theme.palette[isOffice ? 'info' : 'secondary'].main, 0.12),
                    color: categoryColor,
                  }}
                />
              </Box>

              <LinearProgress
                variant="determinate"
                value={pct}
                color={status}
                sx={{
                  height: 5, borderRadius: 3, mb: 0.75,
                  bgcolor: (theme) => alpha(theme.palette[status].main, 0.14),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {formatCurrency(spent)} / {formatCurrency(item.limitAmount)}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: `${status}.main`, whiteSpace: 'nowrap' }}>
                  {exhausted ? 'Limit reached' : `${formatCurrency(remaining)} left`}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};
