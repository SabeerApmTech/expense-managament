import { Box } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuthContext } from '../../store/authStore';

const DRAWER_WIDTH = 240;

export const MainLayout = () => {
  const { role } = useAuthContext();
  const hasSidebar = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {hasSidebar && (
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} drawerWidth={DRAWER_WIDTH} />
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Header
          onMenuToggle={() => setMobileOpen((o) => !o)}
          showMenuToggle={hasSidebar}
        />
        <Box
          component="main"
          sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 }, bgcolor: 'grey.50' }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
