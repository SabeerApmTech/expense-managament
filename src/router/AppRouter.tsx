import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ExpenseListPage } from '../features/expenses/pages/ExpenseListPage';
import { ApprovalsListPage } from '../features/approvals/pages/ApprovalsListPage';
import { UserManagementPage } from '../features/userManagement/pages/UserManagementPage';
import { EmployeeExpenseUsagePage } from '../features/userManagement/pages/EmployeeExpenseUsagePage';
import { AccountsListPage } from '../features/accounts/pages/AccountsListPage';
import { SettlementReportPage } from '../features/accounts/pages/SettlementReportPage';
import { MySettlementsPage } from '../features/accounts/pages/MySettlementsPage';
import { useAuthContext } from '../store/authStore';
import { getHomeRoute } from '../utils/routing';
import { ROUTES } from '../constants/masterData';
import { canAccessAccounts, canAccessApprovals, canAccessExpenses, canAccessUserManagement } from '../utils/access';

export const AppRouter = () => {
  const { isAuthenticated, role } = useAuthContext();
  const homeRoute = getHomeRoute(role);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={ROUTES.LOGIN}
          element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <LoginPage />}
        />

        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoute allow={canAccessExpenses} />}>
            <Route path={ROUTES.EXPENSES} element={<ExpenseListPage />} />
            <Route path={ROUTES.MY_SETTLEMENTS} element={<MySettlementsPage />} />
          </Route>
          <Route element={<ProtectedRoute allow={canAccessApprovals} />}>
            <Route path={ROUTES.APPROVALS} element={<ApprovalsListPage />} />
          </Route>
          <Route element={<ProtectedRoute allow={canAccessAccounts} />}>
            <Route path={ROUTES.ACCOUNTS} element={<AccountsListPage />} />
          </Route>
          <Route element={<ProtectedRoute allow={canAccessUserManagement} />}>
            <Route path={ROUTES.USER_MANAGEMENT} element={<UserManagementPage />} />
            <Route path={ROUTES.EMPLOYEE_EXPENSE_USAGE} element={<EmployeeExpenseUsagePage />} />
            <Route path={ROUTES.SETTLEMENT_REPORT} element={<SettlementReportPage />} />
          </Route>
        </Route>

        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <Navigate to={ROUTES.LOGIN} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
