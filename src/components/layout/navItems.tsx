import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GavelIcon from '@mui/icons-material/Gavel';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useAuthContext } from '../../store/authStore';
import { ROUTES } from '../../constants/masterData';
import { canAccessAccounts, canAccessApprovals, canAccessExpenses, canAccessUserManagement } from '../../utils/access';
import type { AuthUser } from '../../types/auth.types';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  show: (user: AuthUser) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'My Expenses', path: ROUTES.EXPENSES, icon: <ReceiptLongIcon />, show: canAccessExpenses },
  { label: 'Approvals', path: ROUTES.APPROVALS, icon: <GavelIcon />, show: canAccessApprovals },
  { label: 'Accounts', path: ROUTES.ACCOUNTS, icon: <PaymentsIcon />, show: canAccessAccounts },
  { label: 'User Management', path: ROUTES.USER_MANAGEMENT, icon: <PeopleAltIcon />, show: canAccessUserManagement },
  { label: 'Employee Expense Usage', path: ROUTES.EMPLOYEE_EXPENSE_USAGE, icon: <QueryStatsIcon />, show: canAccessUserManagement },
  { label: 'Settlement Report', path: ROUTES.SETTLEMENT_REPORT, icon: <AssessmentIcon />, show: canAccessUserManagement },
  { label: 'My Settlements', path: ROUTES.MY_SETTLEMENTS, icon: <AssessmentIcon />, show: canAccessExpenses },
];

export const useVisibleNavItems = (): NavItem[] => {
  const { user } = useAuthContext();
  return user ? NAV_ITEMS.filter((item) => item.show(user)) : [];
};
