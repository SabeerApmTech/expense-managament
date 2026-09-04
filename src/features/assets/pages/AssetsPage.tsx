import {
  Box, Paper, Typography, Button, Chip, IconButton, Card, CardMedia, CardContent, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import LabelIcon from '@mui/icons-material/Label';
import InventoryIcon from '@mui/icons-material/Inventory2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import { BillViewerDialog } from '../../../components/common/BillViewerDialog';
import { AssetFormDialog } from '../components/AssetFormDialog';
import { AssetTypeManagementDialog } from '../components/AssetTypeManagementDialog';
import { AssetNameManagementDialog } from '../components/AssetNameManagementDialog';
import { useAssets, useDeleteAsset } from '../hooks/useAssets';
import { resolveAssetImageUrl } from '../../../api/assets.api';
import { useAuthContext } from '../../../store/authStore';
import { formatDate } from '../../../utils/formatters';
import type { Asset } from '../../../types/asset.types';

function AssetCard({ asset, canDelete, onView, onDelete }: {
  asset: Asset;
  canDelete: boolean;
  onView: (url: string) => void;
  onDelete: (asset: Asset) => void;
}) {
  const imageUrl = resolveAssetImageUrl(asset.imagePath);
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2.5, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => onView(imageUrl)}>
        <CardMedia
          component="img"
          image={imageUrl}
          alt={asset.assetName}
          sx={{ height: 150, objectFit: 'cover', bgcolor: 'grey.100' }}
        />
        {canDelete && (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(asset); }}
            sx={{
              position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'error.main', color: 'white' },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{asset.assetName}</Typography>
          <Chip size="small" label={asset.assetTypeName} sx={{ fontWeight: 600, flexShrink: 0 }} />
        </Box>
        <Chip
          size="small"
          icon={asset.assignmentType === 'EMPLOYEE' ? <PersonIcon /> : <LocationOnIcon />}
          label={asset.assignmentType === 'EMPLOYEE' ? (asset.assignedEmpName ?? 'Employee') : 'Office'}
          variant="outlined"
          color={asset.assignmentType === 'EMPLOYEE' ? 'secondary' : 'info'}
          sx={{ mb: 0.75 }}
        />
        {asset.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, wordBreak: 'break-word' }}>
            {asset.description}
          </Typography>
        )}
        <Typography variant="caption" color="text.disabled">Added {formatDate(asset.createdAt)}</Typography>
      </CardContent>
    </Card>
  );
}

export const AssetsPage = () => {
  const { user } = useAuthContext();
  const empId = user?.empId ?? '';
  const { data, isLoading, isError, refetch } = useAssets(empId);
  const deleteAsset = useDeleteAsset(empId);

  const [addOpen, setAddOpen] = useState(false);
  const [typesOpen, setTypesOpen] = useState(false);
  const [namesOpen, setNamesOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const isCreator = data?.accessType === 'ASSET_CREATOR';
  const assets = data?.assets ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <InventoryIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isCreator ? 'Office Assets' : 'My Assigned Assets'}
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, mb: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{data?.office.officeName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {[data?.office.city, data?.office.state, data?.office.country].filter(Boolean).join(', ')}
              {' · '}{data?.totalAssetCount ?? 0} asset{(data?.totalAssetCount ?? 0) === 1 ? '' : 's'}
            </Typography>
          </Box>
          {isCreator && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="outlined" size="small" startIcon={<CategoryIcon />} onClick={() => setTypesOpen(true)}>
                Asset Types
              </Button>
              <Button variant="outlined" size="small" startIcon={<LabelIcon />} onClick={() => setNamesOpen(true)}>
                Asset Names
              </Button>
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
                Add Asset
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {assets.length === 0 ? (
        <EmptyState
          title="No assets found"
          description={isCreator ? 'Add your first office asset to get started.' : 'No assets are currently assigned to you.'}
        />
      ) : (
        <Grid container spacing={2}>
          {assets.map((asset) => (
            <Grid key={asset.assetId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <AssetCard asset={asset} canDelete={isCreator} onView={setViewerUrl} onDelete={setDeleteTarget} />
            </Grid>
          ))}
        </Grid>
      )}

      {isCreator && (
        <>
          <AssetFormDialog open={addOpen} onClose={() => setAddOpen(false)} empId={empId} />
          <AssetTypeManagementDialog open={typesOpen} onClose={() => setTypesOpen(false)} empId={empId} />
          <AssetNameManagementDialog open={namesOpen} onClose={() => setNamesOpen(false)} empId={empId} />
          <DeleteConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              if (deleteTarget) deleteAsset.mutate(deleteTarget.assetId, { onSuccess: () => setDeleteTarget(null) });
            }}
            isDeleting={deleteAsset.isPending}
            title="Delete Asset"
            message={deleteTarget ? <>Delete <strong>{deleteTarget.assetName}</strong>? This cannot be undone.</> : undefined}
          />
        </>
      )}
      {viewerUrl && <BillViewerDialog open={!!viewerUrl} url={viewerUrl} title="Asset Image" onClose={() => setViewerUrl(null)} />}
    </Box>
  );
};
