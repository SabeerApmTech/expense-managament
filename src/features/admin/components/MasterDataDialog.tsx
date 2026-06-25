import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, useTheme, useMediaQuery,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import LayersIcon from '@mui/icons-material/Layers';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import GppGoodIcon from '@mui/icons-material/GppGood';
import { useState } from 'react';
import { ExpenseTypeManagementDialog } from './ExpenseTypeManagementDialog';
import { LevelManagementDialog } from './LevelManagementDialog';
import { TravelPayModeDialog } from './TravelPayModeDialog';
import { ApprovalLimitDialog } from './ApprovalLimitDialog';
import { DialogNavItem } from '../../../components/common/DialogNavItem';

interface Props { open: boolean; onClose: () => void; }

const NAV = [
  { label: 'Expense Types', icon: <CategoryIcon fontSize="small" /> },
  { label: 'Levels', icon: <LayersIcon fontSize="small" /> },
  { label: 'Travel & Pay Modes', icon: <DirectionsBusIcon fontSize="small" /> },
  { label: 'Approval Limits', icon: <GppGoodIcon fontSize="small" /> },
];

export const MasterDataDialog = ({ open, onClose }: Props) => {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open} onClose={onClose} fullScreen={isMobile} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : 3, height: isMobile ? '100%' : '88vh', maxHeight: isMobile ? '100%' : 760, display: 'flex', flexDirection: 'column' } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, py: 2, flexShrink: 0 }}>Master Data</DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Box sx={{
          ...(isMobile ? {
            width: '100%', flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider',
            display: 'flex', flexDirection: 'row', overflowX: 'auto', py: 0,
            '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none',
          } : {
            width: 190, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider',
            overflowY: 'auto', display: 'flex', flexDirection: 'column', py: 1,
          }),
        }}>
          {NAV.map((item, idx) => (
            <DialogNavItem key={idx} label={item.label} icon={item.icon}
              active={tab === idx} isMobile={isMobile} onClick={() => setTab(idx)} />
          ))}
        </Box>

        <Box sx={isMobile
          ? { flex: 1, minHeight: 0, overflowY: 'auto' }
          : { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }
        }>
          {tab === 0 && <ExpenseTypeManagementDialog open={false} onClose={() => {}} asPanel />}
          {tab === 1 && <LevelManagementDialog open={false} onClose={() => {}} asPanel />}
          {tab === 2 && <TravelPayModeDialog open={false} onClose={() => {}} asPanel />}
          {tab === 3 && <ApprovalLimitDialog open={false} onClose={() => {}} asPanel />}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, flexShrink: 0 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};
