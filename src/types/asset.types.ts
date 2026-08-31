export interface Asset {
  assetId: number;
  assetName: string;
  assetType: string;
  imagePath: string;
  description?: string | null;
  createdAt: string;
}

export interface OfficeAssets {
  officeId: number;
  officeName: string;
  city: string;
  state: string;
  country: string;
  assets: Asset[];
}
