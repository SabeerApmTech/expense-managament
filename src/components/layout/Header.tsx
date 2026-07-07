import {
  AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import GavelIcon from '@mui/icons-material/Gavel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const TC_SECTIONS = [
  {
    title: '1. Eligibility & Scope',
    body: 'Expense reimbursements are available only to active employees of the company for costs directly and necessarily incurred in the course of official company business. Personal expenses of any nature are strictly excluded.',
  },
  {
    title: '2. Approved Expense Categories',
    body: 'Only expense types explicitly listed under your designation profile are eligible for reimbursement. Any expense submitted outside your mapped categories will be rejected without further review.',
  },
  {
    title: '3. Spending Limits & Employee Responsibility',
    body: 'Each expense category carries a designated monthly reimbursement cap specific to your role. It is solely the employee\'s responsibility to ensure that all submitted expenses remain within the approved limits. The company will not reimburse any amount that exceeds the designated cap, and any expenditure beyond the approved limit is the full financial responsibility of the employee.',
  },
  {
    title: '4. Travel Expenses',
    body: 'Travel expenses are reimbursable only for official trips conducted outside your home state on company-authorised business. All travel must be pre-approved where required. Personal travel, commuting costs, and any detours unrelated to the official purpose are not covered.',
  },
  {
    title: '5. Food & Meal Expenses',
    body: 'Meal expenses are reimbursable only when incurred during official company-related activities, client meetings, or business engagements. Routine personal meals, social gatherings, and team outings not sanctioned by management are not eligible.',
  },
  {
    title: '6. Office & Stationery Materials',
    body: 'Purchases of office supplies and stationery are reimbursable only when procured on behalf of the company for official use. All original receipts or invoices must be retained and submitted as proof. Personal stationery or materials purchased for non-business use are not covered.',
  },
  {
    title: '7. Bill & Receipt Requirements',
    body: 'A valid bill, receipt, or invoice must accompany every expense claim. Claims submitted without supporting documentation will be rejected. For amounts exceeding ₹5,000, a GST-inclusive invoice is mandatory.',
  },
  {
    title: '8. Timely Submission',
    body: 'Expense claims must be submitted within the current billing month. Claims submitted after the monthly cut-off may not be processed for that cycle and are subject to management discretion for the following period.',
  },
  {
    title: '9. Accuracy & Integrity',
    body: 'Employees are expected to submit truthful and accurate claims. Submission of false, inflated, or duplicate claims constitutes a serious violation of company policy and may result in disciplinary action, including termination, and recovery of any amounts improperly reimbursed.',
  },
  {
    title: '10. Policy Updates',
    body: 'The company reserves the right to update these terms at any time. Employees will be notified of material changes, and continued use of the expense management system constitutes acceptance of the revised terms.',
  },
];

const TermsDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper"
    slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
    <DialogTitle sx={{ pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GavelIcon color="primary" />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Terms &amp; Conditions
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Employee Expense Reimbursement Policy
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
    <Divider />
    <DialogContent sx={{ pt: 2.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontStyle: 'italic' }}>
        Please read these terms carefully before submitting any expense claim. By using the expense management system, you agree to abide by the following conditions.
      </Typography>
      {TC_SECTIONS.map((s) => (
        <Box key={s.title} sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
            {s.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
            {s.body}
          </Typography>
        </Box>
      ))}
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        If you have any questions regarding these terms, please contact your HR or Finance department before submitting a claim.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, px: 3 }}>
        I Understand
      </Button>
    </DialogActions>
  </Dialog>
);

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
