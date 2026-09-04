import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '../../../api/assets.api';
import { useManagedMutation } from '../../../utils/mutations';
import type {
  CreateAssetNamePayload, CreateAssetTypePayload, UpdateAssetNamePayload, UpdateAssetTypePayload,
} from '../../../types/asset.types';

export const ASSET_KEYS = {
  types: ['asset-types'] as const,
  activeTypes: ['asset-types', 'active'] as const,
  activeNames: (assetTypeId: number) => ['asset-names', 'active', assetTypeId] as const,
  employees: (empId: string) => ['asset-employees', empId] as const,
  assets: (empId: string) => ['assets', empId] as const,
  nameCount: (assetNameId: number, empId: string) => ['asset-name-count', assetNameId, empId] as const,
};

// A create/edit/delete anywhere in this feature can shift asset counts and active-name
// lists, so every mutation invalidates this whole broad set rather than one exact key.
const ALL_ASSET_PREFIXES = [
  ASSET_KEYS.types, ASSET_KEYS.activeTypes, ['asset-names'] as const, ['assets'] as const, ['asset-name-count'] as const,
];

export const useAssetTypes = () =>
  useQuery({ queryKey: ASSET_KEYS.types, queryFn: () => assetsApi.getTypes() });

export const useActiveAssetTypes = () =>
  useQuery({ queryKey: ASSET_KEYS.activeTypes, queryFn: () => assetsApi.getActiveTypes() });

export const useActiveAssetNames = (assetTypeId: number | undefined) =>
  useQuery({
    queryKey: ASSET_KEYS.activeNames(assetTypeId ?? 0),
    queryFn: () => assetsApi.getActiveNames(assetTypeId as number),
    enabled: !!assetTypeId,
  });

export const useAssetEmployees = (empId: string | undefined) =>
  useQuery({
    queryKey: ASSET_KEYS.employees(empId ?? ''),
    queryFn: () => assetsApi.getEmployees(empId as string),
    enabled: !!empId,
  });

export const useAssets = (empId: string | undefined) =>
  useQuery({
    queryKey: ASSET_KEYS.assets(empId ?? ''),
    queryFn: () => assetsApi.getAssets(empId as string),
    enabled: !!empId,
  });

export const useAssetNameCount = (assetNameId: number | undefined, empId: string | undefined) =>
  useQuery({
    queryKey: ASSET_KEYS.nameCount(assetNameId ?? 0, empId ?? ''),
    queryFn: () => assetsApi.getNameCount(assetNameId as number, empId as string),
    enabled: !!assetNameId && !!empId,
  });

export const useCreateAssetType = (empId: string) =>
  useManagedMutation(
    (payload: CreateAssetTypePayload) => assetsApi.createType(empId, payload),
    ALL_ASSET_PREFIXES,
    { success: (r) => r.message ?? 'Asset type created successfully', error: 'Failed to create asset type' }
  );

export const useUpdateAssetType = (empId: string) =>
  useManagedMutation(
    (vars: { assetTypeId: number; payload: UpdateAssetTypePayload }) =>
      assetsApi.updateType(vars.assetTypeId, empId, vars.payload),
    ALL_ASSET_PREFIXES,
    { success: (r) => r.message ?? 'Asset type updated successfully', error: 'Failed to update asset type' }
  );

export const useDeleteAssetType = (empId: string) =>
  useManagedMutation(
    (assetTypeId: number) => assetsApi.deleteType(assetTypeId, empId),
    ALL_ASSET_PREFIXES,
    { success: (r) => r.message ?? 'Asset type deleted successfully', error: 'Failed to delete asset type' }
  );

export const useCreateAssetName = (empId: string) =>
  useManagedMutation(
    (payload: CreateAssetNamePayload) => assetsApi.createName(empId, payload),
    ALL_ASSET_PREFIXES,
    { success: (r) => r.message ?? 'Asset name created successfully', error: 'Failed to create asset name' }
  );

export const useUpdateAssetName = (empId: string) =>
  useManagedMutation(
    (vars: { assetNameId: number; payload: UpdateAssetNamePayload }) =>
      assetsApi.updateName(vars.assetNameId, empId, vars.payload),
    ALL_ASSET_PREFIXES,
    { success: (r) => r.message ?? 'Asset name updated successfully', error: 'Failed to update asset name' }
  );

export const useDeleteAssetName = (empId: string) =>
  useManagedMutation(
    (assetNameId: number) => assetsApi.deleteName(assetNameId, empId),
    ALL_ASSET_PREFIXES,
    { success: (r) => r.message ?? 'Asset name deleted successfully', error: 'Failed to delete asset name' }
  );

export const useCreateAsset = (empId: string) =>
  useManagedMutation(
    (formData: FormData) => assetsApi.createAsset(empId, formData),
    ALL_ASSET_PREFIXES,
    { success: (r) => r.message ?? 'Asset added successfully', error: 'Failed to add asset' }
  );

export const useUpdateAsset = (empId: string) =>
  useManagedMutation(
    (vars: { assetId: number; formData: FormData }) => assetsApi.updateAsset(vars.assetId, empId, vars.formData),
    ALL_ASSET_PREFIXES,
    { success: (r) => r.message ?? 'Asset updated successfully', error: 'Failed to update asset' }
  );

export const useDeleteAsset = (empId: string) =>
  useManagedMutation(
    (assetId: number) => assetsApi.deleteAsset(assetId, empId),
    ALL_ASSET_PREFIXES,
    { success: (r) => r.message ?? 'Asset deleted successfully', error: 'Failed to delete asset' }
  );
