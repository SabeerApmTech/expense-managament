import {
  AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useAuthContext } from '../../store/authStore';
import { getInitials } from '../../utils/formatters';

interface Props {
  onMenuToggle: () => void;
  showMenuToggle?: boolean;
}

const roleLabel: Record<string, string> = {
  USER: 'User',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export const Header = ({ onMenuToggle, showMenuToggle = false }: Props) => {
  const { user, role, logout } = useAuthContext();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}
    >
      <Toolbar>
        {showMenuToggle && (
          <IconButton edge="start" onClick={onMenuToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
          Expense Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">{roleLabel[role || ''] || ''}</Typography>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 12 }}>
                {getInitials(user?.name)}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => { setAnchor(null); logout(); }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
