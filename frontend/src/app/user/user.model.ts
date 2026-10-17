
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
