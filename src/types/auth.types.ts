export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';

export interface LoginRequest {
  empId: string;
  password: string;
}

export interface AuthUser {
  token: string;
  userId: number;
  empId: string;
  empName: string;
  role: Role;
  phoneNumber: string;
  isActive: boolean;
  isInitiator: boolean;
  isAccountant: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

export type ApiLoginResponse = ApiResponse<AuthUser>;
