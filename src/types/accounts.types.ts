export interface AccountsExpenseItem {
  expenseDetailId: number;
  expenseTypeId: number;
  expenseTypeName: string;
  amount: number;
  isSettled: boolean;
}

export interface PendingSettlement {
  expenseId: number;
  expenseCode: string;
  empId: string;
  empName: string;
  totalExpenseAmount: number;
  approvedAmount: number;
  paidAmount: number;
  remainingApprovedAmount: number;
  remainingTotalAmount: number;
  details: AccountsExpenseItem[];
}

export interface SettlementBill {
  settlementBillId: number;
  settlementBillPath: string;
  createdAt: string;
}

export interface SettledExpenseItem extends AccountsExpenseItem {
  accountingDetailId: number;
}

export interface SettledExpenseRecord {
  empId: string;
  empName: string;
  expenseId: number;
  expenseCode: string;
  expenseDetailId: number;
  expenseTypeId: number;
  expenseTypeName: string;
  settledAmount: number;
  settlementId: number;
  settlementBillId: number;
  settlementBillPath: string;
  settlementDate: string;
}

export interface SettledExpensesReport {
  requestedEmployeeId: string;
  accountantEmpName: string;
  filterEmpId: string | null;
  fromDate: string;
  toDate: string;
  totalSettledAmount: number;
  data: SettledExpenseRecord[];
}

export interface EmployeeSettlementTotal {
  empId: string;
  empName: string;
  totalSettledAmount: number;
}

export interface ExpenseTypeSettlementTotal {
  empId: string;
  empName: string;
  expenseType: string;
  totalSettledAmount: number;
}

export interface SettlementReport {
  requestedEmployeeId: string;
  requestedEmployeeName: string;
  role: string;
  fromDate: string;
  toDate: string;
  totalSettledAmount: number;
  employeeTotals: EmployeeSettlementTotal[];
  expenseTypeTotals: ExpenseTypeSettlementTotal[];
}

export interface SettleExpenseResult {
  settlementId: number;
  settlementBillId: number;
  expenseId: number;
  expenseCode: string;
  totalExpenseAmount: number;
  approvedAmount: number;
  paidAmount: number;
  remainingApprovedAmount: number;
  remainingTotalAmount: number;
  settlementAmount: number;
  accountantEmpId: string;
  accountantEmpName: string;
  settledExpenseItems: SettledExpenseItem[];
  settlementBill: SettlementBill;
}

export interface YearlyUsageMonth {
  monthNumber: number;
  monthName: string;
  amount: number;
}

export interface YearlyUsageExpenseType {
  expenseTypeId: number;
  expenseTypeName: string;
  totalYearlyAmount: number;
  monthlyUsage: YearlyUsageMonth[];
}

export interface YearlyUsageEmployee {
  empId: string;
  empName: string;
  totalYearlyAmount: number;
  expenseTypes: YearlyUsageExpenseType[];
}

// scope is 'OWN_EXPENSES' when a regular user calls this (employees has just
// themself) or an admin-wide scope when an ADMIN/SUPERADMIN calls it (employees
// covers everyone) — the same endpoint, backend decides based on the caller's role.
export interface YearlyUsageReport {
  year: number;
  scope: string;
  totalYearlyAmount: number;
  employees: YearlyUsageEmployee[];
}

export interface OfficeExpenseSettlementItem {
  settlementAmount: number;
  settledOn: string;
}

export interface OfficeExpenseSettlementType {
  expenseTypeId: number;
  expenseTypeName: string;
  totalSettledAmount: number;
  settlement: OfficeExpenseSettlementItem[];
}

export interface OfficeExpenseSettlement {
  officeId: number;
  officeName: string;
  city: string;
  state: string;
  country: string;
  expenseTypes: OfficeExpenseSettlementType[];
}
