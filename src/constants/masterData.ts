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

export const EXPENSE_STATUSES: SelectOption[] = [
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Settled', label: 'Settled' },
];

export const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'info'> = {
  'Submitted': 'warning',
  'Approved': 'success',
  'Approval': 'success',
  'Rejected': 'error',
  'Reject': 'error',
  'Settled': 'info',
  'Settle': 'info',
};

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
    REPORTS: '/admin/reports',
  },
  SUPER_ADMIN: {
    REPORTS: '/super-admin/reports',
  },
} as const;
