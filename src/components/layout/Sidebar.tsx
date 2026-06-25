import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Box, Divider,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../store/authStore';
import { ROUTES } from '../../constants/masterData';

interface Props {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'My Expenses', path: ROUTES.USER.EXPENSES, icon: <ReceiptLongIcon />, roles: ['USER'] },
  { label: 'Add Expense', path: ROUTES.USER.ADD_EXPENSE, icon: <AddCircleOutlinedIcon />, roles: ['USER'] },
  { label: 'Expense List', path: ROUTES.ADMIN.APPROVALS, icon: <AdminPanelSettingsIcon />, roles: ['ADMIN'] },
  { label: 'Expense Approvals', path: ROUTES.ADMIN.APPROVALS, icon: <AdminPanelSettingsIcon />, roles: ['SUPER_ADMIN'] },
  { label: 'Reports', path: ROUTES.ADMIN.REPORTS, icon: <AssessmentIcon />, roles: ['ADMIN', 'SUPER_ADMIN'] },
];

export const Sidebar = ({ open, onClose, drawerWidth }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuthContext();

  const items = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  const content = (
    <Box sx={{ overflow: 'hidden' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 800 }}>
            EMS
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List dense>
        {items.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => { navigate(item.path); onClose(); }}
              sx={{ borderRadius: 1, mx: 1, my: 0.25 }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontSize: 14, fontWeight: active ? 700 : 400 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
      >
        {content}
      </Drawer>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          width: drawerWidth,
          flexShrink: 0,
          height: '100vh',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          overflowY: 'auto',
        }}
      >
        {content}
      </Box>
    </>
  );
};
