import { apiClient } from './axios';
import { unwrap } from '../utils/apiEnvelope';
import type { ApiResponse } from '../types/auth.types';
import type {
  Asset, AssetType, AssetTypeOption, AssetName, AssetNameOption, AssetNameCount, AssetEmployee,
  AssetsResponse, CreateAssetTypePayload, UpdateAssetTypePayload, CreateAssetNamePayload, UpdateAssetNamePayload,
} from '../types/asset.types';

export const ASSET_IMAGE_BASE_URL = 'https://expense.apmiot.com';

export const resolveAssetImageUrl = (path: string): string =>
  path.startsWith('http') ? path : ASSET_IMAGE_BASE_URL + path;

export const assetsApi = {
  // ---- Asset Types ----
  getTypes: async (): Promise<AssetType[]> => {
    const response = await apiClient.get<ApiResponse<AssetType[]>>('/api/assets/types');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  getActiveTypes: async (): Promise<AssetTypeOption[]> => {
    const response = await apiClient.get<ApiResponse<AssetTypeOption[]>>('/api/assets/types/active');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  createType: async (empId: string, payload: CreateAssetTypePayload): Promise<{ data: AssetType; message?: string }> => {
    const response = await apiClient.post(`/api/assets/types`, payload, { params: { empId } });
    return unwrap<AssetType>(response.data);
  },

  updateType: async (
    assetTypeId: number,
    empId: string,
    payload: UpdateAssetTypePayload
  ): Promise<{ data: AssetType; message?: string }> => {
    const response = await apiClient.put(`/api/assets/types/${assetTypeId}`, payload, { params: { empId } });
    return unwrap<AssetType>(response.data);
  },

  deleteType: async (assetTypeId: number, empId: string): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.delete(`/api/assets/types/${assetTypeId}`, { params: { empId } });
    return unwrap<void>(response.data);
  },

  // ---- Asset Names ----
  getActiveNames: async (assetTypeId: number): Promise<AssetNameOption[]> => {
    const response = await apiClient.get<ApiResponse<AssetNameOption[]>>('/api/assets/names/active', {
      params: { assetTypeId },
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  createName: async (empId: string, payload: CreateAssetNamePayload): Promise<{ data: AssetName; message?: string }> => {
    const response = await apiClient.post('/api/assets/names', payload, { params: { empId } });
    return unwrap<AssetName>(response.data);
  },

  updateName: async (
    assetNameId: number,
    empId: string,
    payload: UpdateAssetNamePayload
  ): Promise<{ data: AssetName; message?: string }> => {
    const response = await apiClient.put(`/api/assets/names/${assetNameId}`, payload, { params: { empId } });
    return unwrap<AssetName>(response.data);
  },

  deleteName: async (assetNameId: number, empId: string): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.delete(`/api/assets/names/${assetNameId}`, { params: { empId } });
    return unwrap<void>(response.data);
  },

  getNameCount: async (assetNameId: number, empId: string): Promise<AssetNameCount | null> => {
    const response = await apiClient.get<ApiResponse<AssetNameCount>>(`/api/assets/count/${assetNameId}`, {
      params: { empId },
    });
    return response.data.data ?? null;
  },

  // ---- Employees (for assigning an asset to a specific employee) ----
  getEmployees: async (empId: string): Promise<AssetEmployee[]> => {
    const response = await apiClient.get<ApiResponse<AssetEmployee[]>>('/api/assets/employees', { params: { empId } });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // ---- Assets ----
  // accessType in the response tells the caller whether they're seeing their whole
  // office (ASSET_CREATOR) or just assets personally assigned to them (EMPLOYEE).
  getAssets: async (empId: string): Promise<AssetsResponse> => {
    const response = await apiClient.get<ApiResponse<AssetsResponse>>('/api/assets', { params: { empId } });
    const data = response.data.data;
    return {
      requestedByEmpId: data?.requestedByEmpId ?? empId,
      accessType: data?.accessType ?? 'EMPLOYEE',
      office: data?.office ?? { officeId: 0, officeName: '' },
      totalAssetCount: data?.totalAssetCount ?? 0,
      assetCounts: Array.isArray(data?.assetCounts) ? data.assetCounts : [],
      assets: Array.isArray(data?.assets) ? data.assets : [],
    };
  },

  createAsset: async (empId: string, formData: FormData): Promise<{ data: Asset; message?: string }> => {
    const response = await apiClient.post('/api/assets', formData, {
      params: { empId },
      headers: { 'Content-Type': undefined },
    });
    return unwrap<Asset>(response.data);
  },

  updateAsset: async (assetId: number, empId: string, formData: FormData): Promise<{ data: Asset; message?: string }> => {
    const response = await apiClient.put(`/api/assets/${assetId}`, formData, {
      params: { empId },
      headers: { 'Content-Type': undefined },
    });
    return unwrap<Asset>(response.data);
  },

  // Response is {success, message, assetId} — no `data` field — so unwrap() isn't used here.
  deleteAsset: async (assetId: number, empId: string): Promise<{ message?: string }> => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`/api/assets/${assetId}`, {
      params: { empId },
    });
    return { message: response.data.message };
  },
};
