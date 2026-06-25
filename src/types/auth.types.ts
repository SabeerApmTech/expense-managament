export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  designationId: number | null;
  designation: string | null;
  departmentId: number | null;
  department: string | null;
}

export interface ApiUserPayload {
  id: string;
  name: string;
  email: string;
  role: number | string;
  designationId: number | null;
  designation: string | null;
  departmentId: number | null;
  department: string | null;
}

export interface ApiLoginResponse {
  token: string;
  user: ApiUserPayload;
}
