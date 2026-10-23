export interface RoleModel {
    id?:number;
    role: 'Admin'|'Manager'|'Host'|'Waiter'|'Kitchen';
}
