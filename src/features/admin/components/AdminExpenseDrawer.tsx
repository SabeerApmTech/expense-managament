import {
  Drawer, Box, Typography, IconButton, Divider, Grid, CircularProgress, Alert, Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAdminExpenseDetail } from '../hooks/useAdminExpenses';
import { StatusChip } from '../../../components/common/StatusChip';
import { formatDate, formatCurrency, formatDateTime } from '../../../utils/formatters';

interface Props {
  open: boolean;
  expenseId: string | null;
  onClose: () => void;
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.5, display: 'block', textTransform: 'uppercase', mb: 0.25 }}>
    {children}
  </Typography>
);

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box>
    <Label>{label}</Label>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>{value || '-'}</Typography>
  </Box>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
      {title}
    </Typography>
    <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, border: '1px solid', borderColor: 'grey.200' }}>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  </Box>
);

function DrawerContent({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useAdminExpenseDetail(id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => refetch()}>Failed to load expense details.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
      {/* ID + Status card */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f0f4ff', borderRadius: 2, px: 2, py: 1.5, mb: 2.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>{data.expenseNo}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
            Submitted {formatDateTime(data.submittedOn ?? data.createdDate ?? '')}
          </Typography>
        </Box>
        <StatusChip status={data.status} />
      </Box>

      <Section title="Employee">
        <Grid size={{ xs: 6 }}><Field label="Employee Name" value={data.employeeName} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="Initiated By" value={data.initiatedBy ?? data.createdBy} /></Grid>
      </Section>

      <Divider sx={{ mb: 2.5 }} />

      <Section title="Expense Info">
        <Grid size={{ xs: 6 }}><Field label="Expense Type" value={data.expenseType} /></Grid>
        <Grid size={{ xs: 6 }}>
          <Label>Amount</Label>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(data.amount)}</Typography>
        </Grid>
        <Grid size={{ xs: 6 }}><Field label="Pay Mode" value={data.payMode} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="Travel Mode" value={data.travelMode} /></Grid>
        {data.description && (
          <Grid size={{ xs: 12 }}><Field label="Description" value={data.description} /></Grid>
        )}
      </Section>

      <Divider sx={{ mb: 2.5 }} />

      <Section title="Travel Details">
        <Grid size={{ xs: 6 }}><Field label="From Date" value={formatDate(data.fromDate)} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="To Date" value={formatDate(data.toDate)} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="From Location" value={data.areaFrom} /></Grid>
        <Grid size={{ xs: 6 }}><Field label="To Location" value={data.areaTo} /></Grid>
      </Section>

      {data.rejectReason && (
        <>
          <Divider sx={{ mb: 2.5 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.dark', letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
              Rejection Reason
            </Typography>
            <Box sx={{ bgcolor: '#fffde7', borderRadius: 2, p: 2, border: '1px solid', borderColor: 'warning.light' }}>
              <Typography variant="body2">{data.rejectReason}</Typography>
            </Box>
          </Box>
        </>
      )}

      {data.billUrl && (
        <>
          <Divider sx={{ mb: 2.5 }} />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
              Attachment
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNewIcon fontSize="small" />}
              href={data.billUrl}
              target="_blank"
              rel="noreferrer"
            >
              View Attachment
            </Button>
          </Box>
        </>
      )}
      {data.settlementBillUrl && (
        <>
          <Divider sx={{ mt: 2.5, mb: 2.5 }} />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
              Settlement Proof
            </Typography>
            <Button
              variant="outlined"
              size="small"
              color="success"
              startIcon={<OpenInNewIcon fontSize="small" />}
              href={data.settlementBillUrl}
              target="_blank"
              rel="noreferrer"
            >
              View Settlement Proof
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export const AdminExpenseDrawer = ({ open, expenseId, onClose }: Props) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    slotProps={{ paper: { sx: { width: { xs: '100%', sm: 460 }, display: 'flex', flexDirection: 'column' } } }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f5f7ff', flexShrink: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>Expense Details</Typography>
      <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
    </Box>
    {expenseId && <DrawerContent id={expenseId} />}
  </Drawer>
);
