export type ExpenseStatus = 'Submitted' | 'Approved' | 'Rejected' | 'Settled';

export interface ExpenseTypeMaster {
  id: number;
  name: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string | null;
  updatedDate: string | null;
}

export interface TravelPayModeMaster {
  id: number;
  name: string;
  isTravelMode: boolean;
  createdBy: string;
  createdDate: string;
  updatedBy: string | null;
  updatedDate: string | null;
}

export interface Expense {
  id: string | number;
  expenseNo?: string;
  employeeId?: string;
  employeeName?: string;
  expenseType: string;
  expenseTypeId?: number;
  description: string;
  fromDate: string;
  toDate: string;
  amount: number;
  payMode: string;
  payModeId?: number;
  travelMode: string;
  travelModeId?: number;
  areaFrom: string;
  areaTo: string;
  createdBy?: string;
  createdDate?: string;
  initiatedBy?: string | null;
  submittedOn?: string | null;
  billUrl?: string | null;
  settlementBillUrl?: string | null;
  status: ExpenseStatus;
  approvedBy?: string | null;
  approvedDate?: string | null;
  rejectedBy?: string | null;
  rejectedDate?: string | null;
  rejectReason?: string | null;
  settledBy?: string | null;
  settledDate?: string | null;
  settlementRemarks?: string | null;
}

export interface ExpenseListResponse {
  total: number;
  page: number;
  size: number;
  data: Expense[];
}

export interface SaveExpenseRequest {
  Id: number;
  ExpenseTypeId: number;
  Description: string;
  FromDate: string;
  ToDate: string;
  Amount: number;
  PayModeId: number;
  TravelModeId: number;
  AreaFrom: string;
  AreaTo: string;
  InitiatedBy: string;
  BillFile?: File | null;
}

export interface ApprovalRequest {
  remarks: string;
}

export interface ExpenseFilters {
  fromDate?: string;
  toDate?: string;
  status?: string;
  expenseType?: string;
}

export interface AdminExpenseFilters {
  employee?: string;
  expenseType?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
}

export interface Designation {
  id: number;
  designationName: string;
}

export interface DesignationExpenseMap {
  id: number;
  designationId: number;
  expenseTypeId: number;
  amountRangeFrom: number;
  amountRangeTo: number;
}

export interface DesignationTravelMap {
  id: number;
  designationId: number;
  travelModeId: number;
}

export interface Level {
  id: number;
  name: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

export interface ExpenseLevelMap {
  id: number;
  level: string;
  expenseType: string;
  fromRange: number;
  toRange: number;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}

export interface EmployeeLevelMap {
  id: number;
  employeeId: string;
  employeeName: string;
  levelId: number;
  levelName: string;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}

export interface DesignationLevelMap {
  id: number;
  levelId: number;
  levelName?: string;
  designationId: number;
  designationName?: string;
  fromRange: number;
  toRange: number;
  createdBy?: string;
  createdDate?: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
}

// ─── Expense Page Load ────────────────────────────────────────────────────────

export interface ExpensePageLoadType {
  expenseTypeId: number;
  expenseTypeName: string;
  fromRange: number;
  toRange: number;
}

export interface ExpensePageLoadPayMode {
  paymentModeId: number;
  paymentModeName: string;
}

export interface ExpensePageLoadTravelMode {
  travelModeId: number;
  travelModeName: string;
}

export interface ExpensePageLoad {
  employeeId: string;
  employeeName: string;
  departmentId: number;
  departmentName: string;
  designationId: number;
  designationName: string;
  levelId: number;
  levelName: string;
  expenseTypes: ExpensePageLoadType[];
  travelModes: ExpensePageLoadTravelMode[];
  paymentModes: ExpensePageLoadPayMode[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardData {
  todayEntries: number;
  todayApproved: number;
  todaySettled: number;
  todayRejected: number;
}

// ─── Report ───────────────────────────────────────────────────────────────────

export type ReportRow = Expense;
