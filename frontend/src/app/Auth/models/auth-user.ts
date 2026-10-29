import { User } from "../../components/users/user.model";
import { RoleModel } from "../../Roles/role-model";


export interface AuthUser extends Omit<User,'role'>{
    role:RoleModel;
}
export type RoleWithCredentials= 'Admin'|'Manager'
export type RoleWithPin = 'Host'|'Waiter'|'Kitchen'

export function requireCredentials (role: RoleModel['role']): role is RoleWithCredentials{
    return role==='Admin'||role==='Manager'
}
