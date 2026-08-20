import type { Role } from './auth.types';
import type { ExpenseCategory } from './expenseType.types';

export interface UserAccount {
  userId: number;
  empId: string;
  empName: string;
  dateOfBirth: string;
  role: Role;
  countryCode: string;
  phoneNumber: string;
  isActive: boolean;
  isInitiator: boolean;
  isAccountant: boolean;
  createdByEmpId: string;
  createdByEmpName: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUserPayload {
  empId: string;
  empName: string;
  dateOfBirth: string;
  role: Role;
  countryCode: string;
  phoneNumber: string;
  isActive: boolean;
  isInitiator: boolean;
  isAccountant: boolean;
  createdByEmpId: string;
}

export interface EditUserPayload {
  empId: string;
  empName: string;
  dateOfBirth: string;
  role: Role;
  countryCode: string;
  phoneNumber: string;
  isActive: boolean;
  isInitiator: boolean;
  isAccountant: boolean;
  updatedByEmpId: string;
}

export interface DeleteUsersPayload {
  userIds: number[];
  deletedByEmpId: string;
}

export interface CreateUserExpenseTypeLimitPayload {
  empId: string;
  expenseTypeId: number;
  limitAmount: number;
  createdByEmpId: string;
}

export interface UpdateUserExpenseTypeLimitPayload {
  limitAmount: number;
  updatedByEmpId: string;
}

// Returned by the current-month usage endpoints (get-emp-expense-types /
// get-all-emp-expense-types) — adds category + spend/remaining for the month
// on top of the plain limit record.
export interface EmployeeExpenseTypeUsage {
  userExpenseTypeId: number;
  userId: number;
  empId: string;
  empName: string;
  expenseTypeId: number;
  expenseTypeName: string;
  expenseCategory: ExpenseCategory;
  limitAmount: number;
  settledAmount: number;
  pendingAmount: number;
  remainingAmount: number;
  createdByEmpId: string;
  createdByEmpName: string;
  createdAt: string;
  updatedAt: string | null;
}
