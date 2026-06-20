import { Box, Paper, Button, Typography } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RouteIcon from '@mui/icons-material/Route';
import LayersIcon from '@mui/icons-material/Layers';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import GroupIcon from '@mui/icons-material/Group';
import BadgeIcon from '@mui/icons-material/Badge';
import CategoryIcon from '@mui/icons-material/Category';
import { useState } from 'react';
import { TravelPayModeDialog } from './TravelPayModeDialog';
import { DesignationExpenseMappingDialog } from './DesignationExpenseMappingDialog';
import { DesignationTravelMappingDialog } from './DesignationTravelMappingDialog';
import { LevelManagementDialog } from './LevelManagementDialog';
import { LevelExpenseMappingDialog } from './LevelExpenseMappingDialog';
import { LevelEmployeeMappingDialog } from './LevelEmployeeMappingDialog';
import { LevelDesignationMappingDialog } from './LevelDesignationMappingDialog';
import { ExpenseTypeManagementDialog } from './ExpenseTypeManagementDialog';

export const AdminActionsCard = () => {
  const [travelPayOpen, setTravelPayOpen] = useState(false);
  const [expenseLimitOpen, setExpenseLimitOpen] = useState(false);
  const [travelEligOpen, setTravelEligOpen] = useState(false);
  const [levelMgmtOpen, setLevelMgmtOpen] = useState(false);
  const [levelExpenseOpen, setLevelExpenseOpen] = useState(false);
  const [levelEmployeeOpen, setLevelEmployeeOpen] = useState(false);
  const [levelDesignationOpen, setLevelDesignationOpen] = useState(false);
  const [expenseTypeOpen, setExpenseTypeOpen] = useState(false);

  return (
    <>
      <Paper sx={{ mb: 2, borderRadius: 3, px: 2.5, py: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
          Master Data
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" startIcon={<DirectionsBusIcon />}
            onClick={() => setTravelPayOpen(true)} sx={{ borderRadius: 2 }}>
            Travel & Pay Modes
          </Button>
          <Button variant="outlined" size="small" startIcon={<AccountBalanceWalletIcon />}
            onClick={() => setExpenseLimitOpen(true)} sx={{ borderRadius: 2 }}>
            Expense Limits
          </Button>
          <Button variant="outlined" size="small" startIcon={<RouteIcon />}
            onClick={() => setTravelEligOpen(true)} sx={{ borderRadius: 2 }}>
            Travel Eligibility
          </Button>
          <Button variant="outlined" size="small" startIcon={<LayersIcon />}
            onClick={() => setLevelMgmtOpen(true)} sx={{ borderRadius: 2 }}>
            Levels
          </Button>
          <Button variant="outlined" size="small" startIcon={<CurrencyRupeeIcon />}
            onClick={() => setLevelExpenseOpen(true)} sx={{ borderRadius: 2 }}>
            Level Expense Map
          </Button>
          <Button variant="outlined" size="small" startIcon={<GroupIcon />}
            onClick={() => setLevelEmployeeOpen(true)} sx={{ borderRadius: 2 }}>
            Level Employee Map
          </Button>
          <Button variant="outlined" size="small" startIcon={<BadgeIcon />}
            onClick={() => setLevelDesignationOpen(true)} sx={{ borderRadius: 2 }}>
            Level Designation Map
          </Button>
          <Button variant="outlined" size="small" startIcon={<CategoryIcon />}
            onClick={() => setExpenseTypeOpen(true)} sx={{ borderRadius: 2 }}>
            Expense Types
          </Button>
        </Box>
      </Paper>

      <TravelPayModeDialog open={travelPayOpen} onClose={() => setTravelPayOpen(false)} />
      <DesignationExpenseMappingDialog open={expenseLimitOpen} onClose={() => setExpenseLimitOpen(false)} />
      <DesignationTravelMappingDialog open={travelEligOpen} onClose={() => setTravelEligOpen(false)} />
      <LevelManagementDialog open={levelMgmtOpen} onClose={() => setLevelMgmtOpen(false)} />
      <LevelExpenseMappingDialog open={levelExpenseOpen} onClose={() => setLevelExpenseOpen(false)} />
      <LevelEmployeeMappingDialog open={levelEmployeeOpen} onClose={() => setLevelEmployeeOpen(false)} />
      <LevelDesignationMappingDialog open={levelDesignationOpen} onClose={() => setLevelDesignationOpen(false)} />
      <ExpenseTypeManagementDialog open={expenseTypeOpen} onClose={() => setExpenseTypeOpen(false)} />
    </>
  );
};
