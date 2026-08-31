export interface Office {
  officeId: number;
  officeName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CreateOfficePayload {
  officeName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface EditOfficePayload {
  officeName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  isActive: boolean;
}
