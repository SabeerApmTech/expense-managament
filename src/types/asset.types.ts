export type AssetAssignmentType = 'OFFICE' | 'EMPLOYEE';
// ASSET_CREATOR: the caller manages their whole office's assets (isAssetCreator).
// EMPLOYEE: the caller only sees assets personally assigned to them.
export type AssetAccessType = 'ASSET_CREATOR' | 'EMPLOYEE';

export interface AssetType {
  assetTypeId: number;
  assetTypeName: string;
  isActive: boolean;
  createdAt: string;
}

// Slimmer shape returned by the "active" list endpoint — used to populate selects.
export interface AssetTypeOption {
  assetTypeId: number;
  assetTypeName: string;
}

export interface AssetName {
  assetNameId: number;
  assetTypeId: number;
  assetTypeName?: string;
  assetName: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AssetNameOption {
  assetNameId: number;
  assetName: string;
  assetTypeId: number;
}

export interface AssetOfficeInfo {
  officeId: number;
  officeName: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Asset {
  assetId: number;
  officeId: number;
  officeName: string;
  city?: string;
  assetTypeId: number;
  assetTypeName: string;
  assetNameId: number;
  assetName: string;
  assignmentType: AssetAssignmentType;
  assignedUserId?: number | null;
  assignedEmpId?: string | null;
  assignedEmpName?: string | null;
  imagePath: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface AssetCountByName {
  assetTypeId: number;
  assetTypeName: string;
  assetNameId: number;
  assetName: string;
  count: number;
}

export interface AssetsResponse {
  requestedByEmpId: string;
  accessType: AssetAccessType;
  office: AssetOfficeInfo;
  totalAssetCount: number;
  assetCounts: AssetCountByName[];
  assets: Asset[];
}

export interface AssetNameCount {
  accessType: AssetAccessType;
  office: { officeId: number; officeName: string };
  assetTypeId: number;
  assetTypeName: string;
  assetNameId: number;
  assetName: string;
  totalCount: number;
  officeCount: number;
  employeeAssignedCount: number;
}

export interface AssetEmployee {
  userId: number;
  empId: string;
  empName: string;
  officeId: number;
  department: string;
}

export interface CreateAssetTypePayload {
  assetTypeName: string;
}

export interface UpdateAssetTypePayload {
  assetTypeName: string;
  isActive?: boolean;
}

export interface CreateAssetNamePayload {
  assetTypeId: number;
  assetName: string;
}

export interface UpdateAssetNamePayload {
  assetName: string;
  isActive?: boolean;
}
