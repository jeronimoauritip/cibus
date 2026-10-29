
export interface User {
  id: number;
  dni: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  branchId: number;
  branchName: string;
  role: string;
}

export interface UserRequest {
  dni: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  branchId: number;
  role: string;
  pin: string;
}

export interface UserUpdate {
  dni?: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  branchId?: number;
}

export interface ChangeRoleRequest {
  roleName: string;
  newPin?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Optional filters for the paginated search
export interface UserFilterParams {
  page?: number;
  size?: number;
  sort?: string;
  dni?: number;
  name?: string;
  phoneNumber?: string;
  email?: string;
  branchId?: number;
  userRoleId?: number;
}

// Request to reset the PIN
export interface ResetPinRequest {
  newPin: string;
}
