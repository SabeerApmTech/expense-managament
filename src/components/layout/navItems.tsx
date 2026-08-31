import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GavelIcon from '@mui/icons-material/Gavel';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ApartmentIcon from '@mui/icons-material/Apartment';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import { useAuthContext } from '../../store/authStore';
import { ROUTES } from '../../constants/masterData';
import {
  canAccessAccounts, canAccessApprovals, canAccessExpenses, canAccessUserManagement, canAccessAssets,
} from '../../utils/access';
import type { AuthUser } from '../../types/auth.types';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  show: (user: AuthUser) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Usages', path: ROUTES.USAGES, icon: <TrendingUpIcon />, show: canAccessExpenses },
  { label: 'My Expenses', path: ROUTES.EXPENSES, icon: <ReceiptLongIcon />, show: canAccessExpenses },
  { label: 'Office Expenses', path: ROUTES.OFFICE_EXPENSES, icon: <BusinessCenterIcon />, show: canAccessExpenses },
  { label: 'Approvals', path: ROUTES.APPROVALS, icon: <GavelIcon />, show: canAccessApprovals },
  { label: 'Accounts', path: ROUTES.ACCOUNTS, icon: <PaymentsIcon />, show: canAccessAccounts },
  { label: 'User Management', path: ROUTES.USER_MANAGEMENT, icon: <PeopleAltIcon />, show: canAccessUserManagement },
  { label: 'Employee Expense Usage', path: ROUTES.EMPLOYEE_EXPENSE_USAGE, icon: <QueryStatsIcon />, show: canAccessUserManagement },
  { label: 'Settlement Report', path: ROUTES.SETTLEMENT_REPORT, icon: <AssessmentIcon />, show: canAccessUserManagement },
  { label: 'Office Wise Reports', path: ROUTES.OFFICE_REPORTS, icon: <ApartmentIcon />, show: canAccessUserManagement },
  { label: 'Office Management', path: ROUTES.OFFICE_MANAGEMENT, icon: <DomainAddIcon />, show: canAccessUserManagement },
  { label: 'My Settlements', path: ROUTES.MY_SETTLEMENTS, icon: <AssessmentIcon />, show: canAccessExpenses },
  { label: 'Assets', path: ROUTES.ASSETS, icon: <Inventory2Icon />, show: canAccessAssets },
  // Common to every authenticated role — always last.
  { label: 'Terms & Conditions', path: ROUTES.TERMS, icon: <GavelIcon />, show: () => true },
];

export const useVisibleNavItems = (): NavItem[] => {
  const { user } = useAuthContext();
  return user ? NAV_ITEMS.filter((item) => item.show(user)) : [];
};
