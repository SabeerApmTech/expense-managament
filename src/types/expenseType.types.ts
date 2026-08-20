export type ExpenseCategory = 'Office' | 'Personal';

export interface ExpenseType {
  expenseTypeId: number;
  expenseTypeName: string;
  expenseCategory: ExpenseCategory;
  createdByEmpId: string;
  createdByEmpName: string;
  createdAt: string;
}

export interface CreateExpenseTypePayload {
  expenseTypeName: string;
  expenseCategory: ExpenseCategory;
  createdByEmpId: string;
  createdByEmpName: string;
}
