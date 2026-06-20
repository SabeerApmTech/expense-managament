import { apiClient } from './axios';
import { getStoredToken } from '../store/authStore';
import type { LoginRequest, AuthUser, ApiLoginResponse, Role } from '../types/auth.types';

const ROLE_MAP: Record<number, Role> = {
  1: 'USER',
  2: 'ADMIN',
  3: 'SUPER_ADMIN',
};

// API returns role=1 (USER) for admin accounts — use designationId=null to detect admin
function resolveRole(numericRole: number, designationId: number | null): Role {
  const mapped: Role = ROLE_MAP[numericRole] ?? 'USER';
  if (mapped === 'USER' && designationId === null) return 'ADMIN';
  return mapped;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<{ user: AuthUser; token: string }> => {
    const response = await apiClient.post<ApiLoginResponse>('/api/auth/login', data);
    const { token, user } = response.data;
    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: resolveRole(user.role, user.designationId),
      designationId: user.designationId,
      designation: user.designation,
      departmentId: user.departmentId,
      department: user.department,
    };
    return { user: authUser, token };
  },

  logout: async (): Promise<void> => {
    const token = getStoredToken();
    try {
      await apiClient.post('/api/auth/logout', {}, {
        headers: token ? { Authorization: 'Bearer ' + token } : {},
      });
    } catch {
      // ignore — local session is cleared regardless
    }
  },
};
