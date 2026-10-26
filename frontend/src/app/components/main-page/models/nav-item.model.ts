export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string | null;
  roles: ('ADMIN' | 'MANAGER')[];
  enabled: boolean;
  badge?: string;
  description?: string;
}
