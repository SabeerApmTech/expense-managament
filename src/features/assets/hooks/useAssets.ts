import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '../../../api/assets.api';
import { useManagedMutation } from '../../../utils/mutations';

export const ASSET_KEYS = {
  mine: ['assets', 'mine'] as const,
  allOffices: ['assets', 'all-offices'] as const,
};

export const useMyOfficeAssets = () =>
  useQuery({ queryKey: ASSET_KEYS.mine, queryFn: () => assetsApi.getMyOfficeAssets() });

export const useAllOfficesAssets = () =>
  useQuery({ queryKey: ASSET_KEYS.allOffices, queryFn: () => assetsApi.getAllOfficesAssets() });

export const useCreateAsset = () =>
  useManagedMutation(
    (formData: FormData) => assetsApi.create(formData),
    [ASSET_KEYS.mine, ASSET_KEYS.allOffices],
    { success: (r) => r.message ?? 'Asset added successfully', error: 'Failed to add asset' }
  );

export const useDeleteAsset = () =>
  useManagedMutation(
    (assetId: number) => assetsApi.remove(assetId),
    [ASSET_KEYS.mine, ASSET_KEYS.allOffices],
    { success: (r) => r.message ?? 'Asset deleted successfully', error: 'Failed to delete asset' }
  );
