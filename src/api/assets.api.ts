import { apiClient } from './axios';
import { unwrap } from '../utils/apiEnvelope';
import type { ApiResponse } from '../types/auth.types';
import type { OfficeAssets } from '../types/asset.types';

export const ASSET_IMAGE_BASE_URL = 'https://expense.apmiot.com';

export const resolveAssetImageUrl = (path: string): string =>
  path.startsWith('http') ? path : ASSET_IMAGE_BASE_URL + path;

function normalizeOfficeAssets(entry: unknown): OfficeAssets {
  const o = entry as Partial<OfficeAssets>;
  return {
    officeId: o.officeId ?? 0,
    officeName: o.officeName ?? '',
    city: o.city ?? '',
    state: o.state ?? '',
    country: o.country ?? '',
    assets: Array.isArray(o.assets) ? o.assets : [],
  };
}

export const assetsApi = {
  // The caller's own office — resolved server-side from the auth token, no params needed.
  getMyOfficeAssets: async (): Promise<OfficeAssets> => {
    const response = await apiClient.get<ApiResponse<OfficeAssets>>('/api/assets');
    return normalizeOfficeAssets(response.data.data);
  },

  // ADMIN/SUPERADMIN — every office's assets.
  getAllOfficesAssets: async (): Promise<OfficeAssets[]> => {
    const response = await apiClient.get<ApiResponse<OfficeAssets[]>>('/api/assets/all-offices');
    return Array.isArray(response.data.data) ? response.data.data.map(normalizeOfficeAssets) : [];
  },

  create: async (formData: FormData): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.post('/api/assets', formData, {
      headers: { 'Content-Type': undefined },
    });
    return unwrap<void>(response.data);
  },

  remove: async (assetId: number): Promise<{ data: void; message?: string }> => {
    const response = await apiClient.delete(`/api/assets/${assetId}`);
    return unwrap<void>(response.data);
  },
};
