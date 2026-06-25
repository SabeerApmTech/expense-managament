import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Divider, useTheme, useMediaQuery,
} from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import GroupIcon from '@mui/icons-material/Group';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RouteIcon from '@mui/icons-material/Route';
import { useState } from 'react';
import { LevelExpenseMappingDialog } from './LevelExpenseMappingDialog';
import { LevelEmployeeMappingDialog } from './LevelEmployeeMappingDialog';
import { LevelDesignationMappingDialog } from './LevelDesignationMappingDialog';
import { DesignationExpenseMappingDialog } from './DesignationExpenseMappingDialog';
import { DesignationTravelMappingDialog } from './DesignationTravelMappingDialog';
import { DialogNavItem } from '../../../components/common/DialogNavItem';

interface Props { open: boolean; onClose: () => void; }

const NAV_GROUPS = [
  {
    section: 'Level Rules',
    items: [
      { label: 'Expense Limits', icon: <CurrencyRupeeIcon fontSize="small" /> },
      { label: 'Employees', icon: <GroupIcon fontSize="small" /> },
      { label: 'Designations', icon: <BadgeIcon fontSize="small" /> },
    ],
  },
  {
    section: 'Designation Rules',
    items: [
      { label: 'Expense Limits', icon: <AccountBalanceWalletIcon fontSize="small" /> },
      { label: 'Travel Eligibility', icon: <RouteIcon fontSize="small" /> },
    ],
  },
];

const FLAT_NAV = NAV_GROUPS.flatMap(g => g.items);

export const MappingsDialog = ({ open, onClose }: Props) => {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open} onClose={onClose} fullScreen={isMobile} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : 3, height: isMobile ? '100%' : '88vh', maxHeight: isMobile ? '100%' : 780, display: 'flex', flexDirection: 'column' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, py: 2, flexShrink: 0 }}>Rules & Mappings</DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {isMobile ? (
          <Box sx={{
            width: '100%', flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider',
            display: 'flex', flexDirection: 'row', overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}>
            {FLAT_NAV.map((item, idx) => (
              <DialogNavItem key={idx} label={item.label} icon={item.icon}
                active={tab === idx} isMobile onClick={() => setTab(idx)} />
            ))}
          </Box>
        ) : (
          <Box sx={{ width: 190, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', overflowY: 'auto', py: 1 }}>
            {(() => {
              let flatIdx = 0;
              return NAV_GROUPS.map((group, gi) => (
                <Box key={gi}>
                  {gi > 0 && <Divider sx={{ my: 1 }} />}
                  <Typography variant="caption" sx={{
                    fontWeight: 700, color: 'text.secondary', letterSpacing: 0.8,
                    textTransform: 'uppercase', px: 2, display: 'block', mb: 0.5,
                    mt: gi === 0 ? 0.5 : 0,
                  }}>
                    {group.section}
                  </Typography>
                  {group.items.map((item) => {
                    const idx = flatIdx++;
                    return (
                      <DialogNavItem key={idx} label={item.label} icon={item.icon}
                        active={tab === idx} isMobile={false} onClick={() => setTab(idx)} />
                    );
                  })}
                </Box>
              ));
            })()}
          </Box>
        )}

        <Box sx={isMobile
          ? { flex: 1, minHeight: 0, overflowY: 'auto' }
          : { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }
        }>
          {tab === 0 && <LevelExpenseMappingDialog open={false} onClose={() => {}} asPanel />}
          {tab === 1 && <LevelEmployeeMappingDialog open={false} onClose={() => {}} asPanel />}
          {tab === 2 && <LevelDesignationMappingDialog open={false} onClose={() => {}} asPanel />}
          {tab === 3 && <DesignationExpenseMappingDialog open={false} onClose={() => {}} asPanel />}
          {tab === 4 && <DesignationTravelMappingDialog open={false} onClose={() => {}} asPanel />}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, flexShrink: 0 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};
