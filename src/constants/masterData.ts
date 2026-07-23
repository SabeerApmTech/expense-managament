import type { SelectOption } from '../types/common.types';

export const EXPENSE_TYPES: SelectOption[] = [
  { value: 'Food', label: 'Food' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Conveyance', label: 'Conveyance' },
  { value: 'Accommodation', label: 'Accommodation' },
  { value: 'Fuel', label: 'Fuel' },
  { value: 'Courier', label: 'Courier' },
  { value: 'Office Expense', label: 'Office Expense' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Client Meeting', label: 'Client Meeting' },
  { value: 'Other', label: 'Other' },
];

export const PAY_MODES: SelectOption[] = [
  { value: 'Cash', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Debit Card', label: 'Debit Card' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Company Card', label: 'Company Card' },
];

export const TRAVEL_MODES: SelectOption[] = [
  { value: 'Bike', label: 'Bike' },
  { value: 'Car', label: 'Car' },
  { value: 'Auto', label: 'Auto' },
  { value: 'Bus', label: 'Bus' },
  { value: 'Train', label: 'Train' },
  { value: 'Flight', label: 'Flight' },
  { value: 'Metro', label: 'Metro' },
  { value: 'Taxi', label: 'Taxi' },
];

export const STATUS_ID_MAP: Record<number, string> = {
  1: 'Submitted',
  2: 'Initiated Approved',
  3: 'Admin Approved',
  4: 'Super Admin Approved',
  5: 'Rejected',
  6: 'Settled',
};

export const EXPENSE_STATUSES: SelectOption[] = [
  { value: '1', label: 'Submitted' },
  { value: '2', label: 'Initiated Approved' },
  { value: '3', label: 'Admin Approved' },
  { value: '4', label: 'Super Admin Approved' },
  { value: '5', label: 'Rejected' },
  { value: '6', label: 'Settled' },
];

export const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
  'Submitted': 'warning',
  'Initiated Approved': 'warning',
  'Admin Approved': 'success',
  'Super Admin Approved': 'success',
  'Approved': 'success',
  'Approval': 'success',
  'Rejected': 'error',
  'Reject': 'error',
  'Settled': 'info',
  'Settle': 'info',
};

export const resolveStatusLabel = (status: string | number): string => {
  const id = Number(status);
  return !isNaN(id) && STATUS_ID_MAP[id] ? STATUS_ID_MAP[id] : String(status);
};

export const isSubmitted = (s: string | number) => s === 1 || s === 'Submitted';
export const isApproved = (s: string | number) =>
  [3, 4].includes(Number(s)) || ['Approved', 'Approved1', 'Approved2', 'Admin Approved', 'Super Admin Approved'].includes(String(s));
export const isRejected = (s: string | number) => s === 5 || s === 'Rejected';
export const isSettled = (s: string | number) => s === 6 || s === 'Settled';

export const ROUTES = {
  LOGIN: '/login',
  USER: {
    EXPENSES: '/expenses',
    ADD_EXPENSE: '/expenses/add',
    EDIT_EXPENSE: '/expenses/:id/edit',
    EXPENSE_DETAILS: '/expenses/:id',
  },
  ADMIN: {
    APPROVALS: '/admin/approvals',
    APPROVAL_DETAILS: '/admin/approvals/:id',
    REPORTS: '/reports',
    SETTLEMENT_HISTORY: '/settlement-history',
  },
  SUPER_ADMIN: {
    REPORTS: '/reports',
    SETTLEMENT_HISTORY: '/settlement-history',
  },
} as const;
