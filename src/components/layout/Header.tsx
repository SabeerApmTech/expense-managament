import {
  AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Tooltip, Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import GavelIcon from '@mui/icons-material/Gavel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../store/authStore';
import { getInitials } from '../../utils/formatters';
import { TermsDialog } from './TermsDialog';

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
  const [termsOpen, setTermsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAccountsTeam = user?.department === 'Accounts';

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
          {isAccountsTeam && (
            <Button
              size="small"
              startIcon={<AssessmentIcon />}
              variant={location.pathname === '/reports' ? 'contained' : 'text'}
              onClick={() => navigate('/reports')}
              sx={{ mr: 1 }}
            >
              Reports
            </Button>
          )}
          <Typography variant="body2" color="text.secondary">
            {role === 'USER' ? user?.name : roleLabel[role || ''] || ''}
          </Typography>
          <Tooltip title="Account">
            <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 12 }}>
                {getInitials(user?.name)}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => { setAnchor(null); setTermsOpen(true); }}>
              <GavelIcon fontSize="small" sx={{ mr: 1 }} />
              Terms &amp; Conditions
            </MenuItem>
            <MenuItem onClick={() => { setAnchor(null); logout(); }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} />
    </AppBar>
  );
};
