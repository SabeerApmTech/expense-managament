import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { MyExpensesPage } from '../features/expenses/pages/MyExpensesPage';
import { OfficeExpensesPage } from '../features/expenses/pages/OfficeExpensesPage';
import { ApprovalsListPage } from '../features/approvals/pages/ApprovalsListPage';
import { UserManagementPage } from '../features/userManagement/pages/UserManagementPage';
import { EmployeeExpenseUsagePage } from '../features/userManagement/pages/EmployeeExpenseUsagePage';
import { AccountsListPage } from '../features/accounts/pages/AccountsListPage';
import { SettlementReportPage } from '../features/accounts/pages/SettlementReportPage';
import { MySettlementsPage } from '../features/accounts/pages/MySettlementsPage';
import { UsagesPage } from '../features/accounts/pages/UsagesPage';
import { OfficeReportsPage } from '../features/accounts/pages/OfficeReportsPage';
import { AssetsPage } from '../features/assets/pages/AssetsPage';
import { OfficeManagementPage } from '../features/offices/pages/OfficeManagementPage';
import { TermsPage } from '../features/terms/pages/TermsPage';
import { useAuthContext } from '../store/authStore';
import { getHomeRoute } from '../utils/routing';
import { ROUTES } from '../constants/masterData';
import {
  canAccessAccounts, canAccessApprovals, canAccessExpenses, canAccessUserManagement, canAccessAssets,
} from '../utils/access';

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
            <Route path={ROUTES.USAGES} element={<UsagesPage />} />
            <Route path={ROUTES.EXPENSES} element={<MyExpensesPage />} />
            <Route path={ROUTES.OFFICE_EXPENSES} element={<OfficeExpensesPage />} />
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
            <Route path={ROUTES.OFFICE_REPORTS} element={<OfficeReportsPage />} />
            <Route path={ROUTES.OFFICE_MANAGEMENT} element={<OfficeManagementPage />} />
          </Route>
          <Route element={<ProtectedRoute allow={canAccessAssets} />}>
            <Route path={ROUTES.ASSETS} element={<AssetsPage />} />
          </Route>
          <Route element={<ProtectedRoute allow={() => true} />}>
            <Route path={ROUTES.TERMS} element={<TermsPage />} />
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
