import { Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import type { ActionItem } from '../../../components/common/DataTable';
import { OfficeFormDialog } from '../components/OfficeFormDialog';
import { useOffices } from '../hooks/useOffices';
import { formatDate } from '../../../utils/formatters';
import type { Office } from '../../../types/office.types';
import type { Column } from '../../../types/common.types';

export const OfficeManagementPage = () => {
  const { data = [], isLoading, isError, refetch } = useOffices();
  const [formOpen, setFormOpen] = useState(false);
  const [editOffice, setEditOffice] = useState<Office | null>(null);

  const columns: Column<Office>[] = [
    { id: 'officeName', label: 'Office Name', minWidth: 130, sortable: true },
    { id: 'address', label: 'Address', minWidth: 200 },
    { id: 'city', label: 'City', minWidth: 110, sortable: true },
    { id: 'state', label: 'State', minWidth: 110 },
    { id: 'country', label: 'Country', minWidth: 100 },
    { id: 'pincode', label: 'Pincode', minWidth: 90 },
    {
      id: 'isActive', label: 'Active', minWidth: 90,
      render: (v) => <Chip size="small" label={v ? 'Active' : 'Inactive'} color={v ? 'success' : 'default'} />,
    },
    { id: 'createdBy', label: 'Created By', minWidth: 110 },
    { id: 'createdAt', label: 'Created On', minWidth: 120, render: (v) => formatDate(String(v || '')), exportValue: (v) => formatDate(String(v || '')) },
  ];

  const rowActions = (row: Office): ActionItem[] => [
    { label: 'Edit', icon: <EditIcon fontSize="small" />, onClick: () => { setEditOffice(row); setFormOpen(true); } },
  ];

  return (
    <>
      <DataTable<Office & Record<string, unknown>>
        columns={columns as Column<Office & Record<string, unknown>>[]}
        rows={data as (Office & Record<string, unknown>)[]}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        rowKey="officeId"
        title="Office Management"
        searchPlaceholder="Search offices..."
        showSerialNo
        onAdd={() => { setEditOffice(null); setFormOpen(true); }}
        addLabel="Add Office"
        rowActions={rowActions}
      />

      <OfficeFormDialog open={formOpen} onClose={() => setFormOpen(false)} editOffice={editOffice} />
    </>
  );
};
