import { RoleModel } from "../../Roles/role-model";
import { UserModel } from "../../Users/user-model";

export interface AuthUser extends Omit<UserModel,'role'>{
    role:RoleModel;
}
export type RoleWithCredentials= 'Admin'|'Manager'
export type RoleWithPin = 'Host'|'Waiter'|'Kitchen'

export function requireCredentials (role: RoleModel['role']): role is RoleWithCredentials{
    return role==='Admin'||role==='Manager'
}
