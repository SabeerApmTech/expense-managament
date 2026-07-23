import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { UserLayout } from '../components/layout/UserLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ExpenseListPage } from '../features/expenses/pages/ExpenseListPage';
import { AddExpensePage } from '../features/expenses/pages/AddExpensePage';
import { EditExpensePage } from '../features/expenses/pages/EditExpensePage';
import { ExpenseDetailsPage } from '../features/expenses/pages/ExpenseDetailsPage';
import { ExpenseApprovalListPage } from '../features/admin/pages/ExpenseApprovalListPage';
import { AdminExpenseDetailsPage } from '../features/admin/pages/AdminExpenseDetailsPage';
import { AdminReportPage } from '../features/admin/pages/AdminReportPage';
import { SettlementHistoryPage } from '../features/admin/pages/SettlementHistoryPage';
import { useAuthContext } from '../store/authStore';
import { getHomeRoute } from '../utils/routing';

export const AppRouter = () => {
  const { isAuthenticated, role, user } = useAuthContext();
  const homeRoute = getHomeRoute(role, user?.department);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <LoginPage />}
        />

        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route element={<UserLayout />}>
            <Route path="/expenses" element={<ExpenseListPage />} />
            <Route path="/expenses/add" element={<AddExpensePage />} />
            <Route path="/expenses/:id/edit" element={<EditExpensePage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} allowedDepartments={['Accounts']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/approvals" element={<ExpenseApprovalListPage />} />
            <Route path="/admin/approvals/:id" element={<AdminExpenseDetailsPage />} />
            <Route path="/reports" element={<AdminReportPage />} />
            <Route path="/settlement-history" element={<SettlementHistoryPage />} />
          </Route>
        </Route>

        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
