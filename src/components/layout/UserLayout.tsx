import {
  Box, AppBar, Toolbar, Typography, Avatar, Menu, MenuItem,
  IconButton, Tooltip,
} from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuthContext } from '../../store/authStore';
import { getInitials } from '../../utils/formatters';

export const UserLayout = () => {
  const { logout, user } = useAuthContext();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <DashboardIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', flex: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
            EMS
          </Typography>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 12 }}>{getInitials(user?.name)}</Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => { setAnchor(null); logout(); }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, bgcolor: 'grey.50' }}>
        <Outlet />
      </Box>
    </Box>
  );
};
