export type ExpenseStatus = string | number;

export interface ExpenseDetail {
  id: number;
  expenseTypeId: number;
  initiatedBy?: string | null;
  initiatedApprovedBy?: string | null;
  initiatedApprovedDate?: string | null;
  status?: number;
  description?: string | null;
  fromDate: string;
  toDate: string;
  amount: number;
  payModeId: number;
  travelModeId: number;
  areaFrom?: string | null;
  areaTo?: string | null;
  billUrl?: string | null;
}

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
  amount: number;
  status: ExpenseStatus;
  initiatedBy?: string | null;
  submittedOn?: string | null;
  approvedBy?: string | null;
  approved1By?: string | null;
  approved1Date?: string | null;
  approved2By?: string | null;
  approved2Date?: string | null;
  rejectedBy?: string | null;
  settledby?: string | null;
  details?: ExpenseDetail[];
  // legacy / flat fields (returned in some endpoints)
  expenseType?: string;
  expenseTypeId?: number;
  description?: string | null;
  fromDate?: string;
  toDate?: string;
  areaFrom?: string | null;
  areaTo?: string | null;
  payMode?: string;
  payModeId?: number;
  travelMode?: string;
  travelModeId?: number;
  createdBy?: string;
  createdDate?: string;
  billUrl?: string | null;
  settlementBillUrl?: string | null;
  rejectReason?: string | null;
  settledBy?: string | null;
  settledDate?: string | null;
  settlementRemarks?: string | null;
  settledAmount?: number;
  approvedDate?: string | null;
  rejectedDate?: string | null;
}

export interface ExpenseListResponse {
  total: number;
  page: number;
  size: number;
  settledAmount?: number;
  data: Expense[];
}

export interface ExpenseItemPayload {
  InitiatedBy: string;
  ExpenseTypeId: number;
  Description: string;
  FromDate: string;
  ToDate: string;
  Amount: number;
  PayModeId: number;
  TravelModeId: number;
  AreaFrom: string;
  AreaTo: string;
  FileIndices: number[];
}

export interface SaveExpenseRequest {
  Id: number;
  ItemsJson: string;
  BillFiles: File[];
}

export interface ApprovalLimit {
  id: number;
  initiatedLimit: number;
  adminLimit: number;
  superAdminLimit: number;
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
  travelModeId: string; // API returns string, possibly comma-separated e.g. "2,4"
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
  todaySubmited: number;
  todayInitiatedApproved: number;
  todayApproved1: number;
  todayApproved2: number;
  todaySettled: number;
  todayRejected: number;
}

// ─── Report ───────────────────────────────────────────────────────────────────

export type ReportRow = Expense;

// ─── Settlement History ────────────────────────────────────────────────────────

export interface DailySettlementSummary {
  date: string;
  amount: number;
}

export interface MonthlySettlementSummary {
  year: number;
  month: number;
  monthName: string;
  amount: number;
}

export interface EmployeeSettlementSummary {
  employeeId: string;
  employeeName: string;
  amount: number;
}

export interface SettlementHistoryResponse {
  dailySummary: DailySettlementSummary[];
  monthlySummary: MonthlySettlementSummary[];
  employeeSummary: EmployeeSettlementSummary[];
}
