import { Box, Paper, Typography, Button, Chip, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import PaidIcon from '@mui/icons-material/Paid';
import CategoryIcon from '@mui/icons-material/Category';
import { useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import type { ActionItem } from '../../../components/common/DataTable';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import { UserFormDialog } from '../components/UserFormDialog';
import { ExpenseLimitsDialog } from '../components/ExpenseLimitsDialog';
import { ExpenseTypeManagementDialog } from '../../expenseTypes/components/ExpenseTypeManagementDialog';
import { useUsers, useDeleteUsers, useEditUser } from '../hooks/useUserManagement';
import { useResetPassword } from '../../auth/hooks/useResetPassword';
import { useAuthContext } from '../../../store/authStore';
import type { AuthUser } from '../../../types/auth.types';
import type { UserAccount } from '../../../types/user.types';
import type { Column } from '../../../types/common.types';

interface UserFlagSwitchProps {
  row: UserAccount;
  field: 'isInitiator' | 'isAccountant' | 'isAssetCreator';
  currentUser: AuthUser;
}

function UserFlagSwitch({ row, field, currentUser }: UserFlagSwitchProps) {
  const { mutate, isPending } = useEditUser();
  return (
    <Switch
      size="small"
      checked={row[field]}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        mutate({
          userId: row.userId,
          payload: {
            empId: row.empId,
            empName: row.empName,
            dateOfBirth: row.dateOfBirth,
            officeId: row.officeId,
            department: row.department,
            email: row.email,
            bloodGroup: row.bloodGroup,
            role: row.role,
            countryCode: row.countryCode,
            phoneNumber: row.phoneNumber,
            isActive: row.isActive,
            isInitiator: field === 'isInitiator' ? e.target.checked : row.isInitiator,
            isAccountant: field === 'isAccountant' ? e.target.checked : row.isAccountant,
            isAssetCreator: field === 'isAssetCreator' ? e.target.checked : row.isAssetCreator,
            updatedByEmpId: currentUser.empId,
          },
        });
      }}
    />
  );
}

export const UserManagementPage = () => {
  const { user: currentUser } = useAuthContext();
  const { data = [], isLoading, isError, refetch } = useUsers();
  const users = data.filter((u) => u.role === 'USER');
  const deleteUsersMutation = useDeleteUsers();
  const resetPasswordMutation = useResetPassword();

  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserAccount | null>(null);
  const [limitsUser, setLimitsUser] = useState<UserAccount | null>(null);
  const [resetTarget, setResetTarget] = useState<UserAccount | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [expenseTypesOpen, setExpenseTypesOpen] = useState(false);

  const columns: Column<UserAccount>[] = [
    { id: 'empId', label: 'Employee ID', minWidth: 110, sortable: true },
    { id: 'empName', label: 'Name', minWidth: 150, sortable: true },
    { id: 'phoneNumber', label: 'Phone', minWidth: 130, render: (_v, row) => `${row.countryCode} ${row.phoneNumber}` },
    {
      id: 'isActive', label: 'Active', minWidth: 90,
      render: (v) => <Chip size="small" label={v ? 'Active' : 'Inactive'} color={v ? 'success' : 'default'} />,
    },
    {
      id: 'isInitiator', label: 'Initiator', minWidth: 90,
      render: (_v, row) => (currentUser ? <UserFlagSwitch row={row} field="isInitiator" currentUser={currentUser} /> : null),
    },
    {
      id: 'isAccountant', label: 'Accountant', minWidth: 100,
      render: (_v, row) => (currentUser ? <UserFlagSwitch row={row} field="isAccountant" currentUser={currentUser} /> : null),
    },
    {
      id: 'isAssetCreator', label: 'Asset Creator', minWidth: 110,
      render: (_v, row) => (currentUser ? <UserFlagSwitch row={row} field="isAssetCreator" currentUser={currentUser} /> : null),
    },
  ];

  const rowActions = (row: UserAccount): ActionItem[] => [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: () => { setEditUser(row); setFormOpen(true); } },
    { label: 'Expense Limits', icon: <PaidIcon fontSize="small" />, onClick: () => setLimitsUser(row) },
    { label: 'Reset Password', icon: <LockResetIcon fontSize="small" />, color: 'warning', onClick: () => setResetTarget(row) },
  ];

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
        <Button variant="outlined" startIcon={<CategoryIcon />} onClick={() => setExpenseTypesOpen(true)}>
          Manage Expense Types
        </Button>
      </Box>

      {selectedIds.length > 0 && (
        <Paper sx={{ mb: 2, borderRadius: 3, px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff4f0' }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedIds.length} selected</Typography>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" size="small" onClick={() => setSelectedIds([])}>Clear</Button>
          <Button variant="contained" color="error" size="small" onClick={() => setDeleteSelectedOpen(true)}>
            Delete Selected
          </Button>
        </Paper>
      )}

      <DataTable<UserAccount & Record<string, unknown>>
        columns={columns as Column<UserAccount & Record<string, unknown>>[]}
        rows={users as (UserAccount & Record<string, unknown>)[]}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        rowKey="userId"
        title="User Management"
        searchPlaceholder="Search users..."
        showSerialNo
        onAdd={() => { setEditUser(null); setFormOpen(true); }}
        addLabel="Add User"
        rowActions={rowActions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} editUser={editUser} />

      <ExpenseLimitsDialog open={!!limitsUser} onClose={() => setLimitsUser(null)} targetUser={limitsUser} />

      <ExpenseTypeManagementDialog open={expenseTypesOpen} onClose={() => setExpenseTypesOpen(false)} />

      <DeleteConfirmDialog
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        onConfirm={() => {
          if (resetTarget) resetPasswordMutation.mutate(resetTarget.empId, { onSuccess: () => setResetTarget(null) });
        }}
        isDeleting={resetPasswordMutation.isPending}
        title="Reset Password"
        message={resetTarget ? <>Reset the password for <strong>{resetTarget.empName}</strong>?</> : undefined}
        confirmLabel="Reset"
        confirmIcon={<LockResetIcon />}
        confirmColor="warning"
      />

      <DeleteConfirmDialog
        open={deleteSelectedOpen}
        onClose={() => setDeleteSelectedOpen(false)}
        onConfirm={() => {
          if (!currentUser) return;
          deleteUsersMutation.mutate(
            { userIds: selectedIds as number[], deletedByEmpId: currentUser.empId },
            { onSuccess: () => { setDeleteSelectedOpen(false); setSelectedIds([]); } }
          );
        }}
        isDeleting={deleteUsersMutation.isPending}
        title="Delete Users"
        message={`Delete ${selectedIds.length} selected user(s)? This cannot be undone.`}
      />
    </Box>
  );
};
