import {
  Box, Paper, Typography, Button, Chip, IconButton, Card, CardMedia, CardContent, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useState } from 'react';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import { BillViewerDialog } from '../../../components/common/BillViewerDialog';
import { AssetFormDialog } from '../components/AssetFormDialog';
import { useMyOfficeAssets, useAllOfficesAssets, useDeleteAsset } from '../hooks/useAssets';
import { resolveAssetImageUrl } from '../../../api/assets.api';
import { useAuthContext } from '../../../store/authStore';
import { formatDate } from '../../../utils/formatters';
import type { Asset, OfficeAssets } from '../../../types/asset.types';

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
          <Chip size="small" label={asset.assetType} sx={{ fontWeight: 600, flexShrink: 0 }} />
        </Box>
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

function AssetGrid({ assets, canDelete, onView, onDelete }: {
  assets: Asset[];
  canDelete: boolean;
  onView: (url: string) => void;
  onDelete: (asset: Asset) => void;
}) {
  if (assets.length === 0) return <EmptyState />;
  return (
    <Grid container spacing={2}>
      {assets.map((asset) => (
        <Grid key={asset.assetId} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <AssetCard asset={asset} canDelete={canDelete} onView={onView} onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
}

function OfficeHeader({ office }: { office: OfficeAssets }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <LocationOnIcon color="primary" fontSize="small" />
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{office.officeName}</Typography>
        <Typography variant="caption" color="text.secondary">
          {[office.city, office.state, office.country].filter(Boolean).join(', ')}
        </Typography>
      </Box>
      <Chip size="small" label={`${office.assets.length} asset${office.assets.length === 1 ? '' : 's'}`} sx={{ ml: 'auto', fontWeight: 600 }} />
    </Box>
  );
}

function MyOfficeAssetsView() {
  const { data, isLoading, isError, refetch } = useMyOfficeAssets();
  const deleteAsset = useDeleteAsset();
  const [addOpen, setAddOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <Box>
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2.5, mb: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          {data && <OfficeHeader office={data} />}
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            Add Asset
          </Button>
        </Box>
      </Paper>

      <AssetGrid
        assets={data?.assets ?? []}
        canDelete
        onView={setViewerUrl}
        onDelete={setDeleteTarget}
      />

      <AssetFormDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {viewerUrl && <BillViewerDialog open={!!viewerUrl} url={viewerUrl} title="Asset Image" onClose={() => setViewerUrl(null)} />}
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
    </Box>
  );
}

function AllOfficesAssetsView() {
  const { data = [], isLoading, isError, refetch } = useAllOfficesAssets();
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (data.length === 0) return <EmptyState />;

  return (
    <Box>
      {data.map((office) => (
        <Paper key={office.officeId} variant="outlined" sx={{ borderRadius: 2, p: 2.5, mb: 2.5 }}>
          <OfficeHeader office={office} />
          <AssetGrid assets={office.assets} canDelete={false} onView={setViewerUrl} onDelete={() => {}} />
        </Paper>
      ))}
      {viewerUrl && <BillViewerDialog open={!!viewerUrl} url={viewerUrl} title="Asset Image" onClose={() => setViewerUrl(null)} />}
    </Box>
  );
}

export const AssetsPage = () => {
  const { role } = useAuthContext();
  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <InventoryIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {isAdmin ? 'Assets — All Offices' : 'Office Assets'}
        </Typography>
      </Box>
      {isAdmin ? <AllOfficesAssetsView /> : <MyOfficeAssetsView />}
    </Box>
  );
};
