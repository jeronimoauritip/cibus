import { NavItem } from '../models/nav-item.model';

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: 'home',
    route: '/home',
    roles: ['ADMIN', 'MANAGER'],
    enabled: true
  },
  {
    id: 'sucursales',
    label: 'Sucursales',
    icon: 'building',
    route: '/branches',
    roles: ['ADMIN'],
    enabled: true
  },
  {
    id: 'empleados',
    label: 'Empleados',
    icon: 'users',
    route: '/users',
    roles: ['ADMIN', 'MANAGER'],
    enabled: true
  },
  {
    id: 'mesas',
    label: 'Mesas',
    icon: 'table',
    route: null,
    roles: ['ADMIN', 'MANAGER'],
    enabled: false,
    badge: 'Pronto',
    description: 'Gestión y asignación de mesas en tiempo real'
  },
  {
    id: 'menu',
    label: 'Menú',
    icon: 'book',
    route: null,
    roles: ['ADMIN', 'MANAGER'],
    enabled: false,
    badge: 'Pronto',
    description: 'Catálogo de platos y bebidas por sucursal'
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    icon: 'clipboard',
    route: null,
    roles: ['ADMIN', 'MANAGER'],
    enabled: false,
    badge: 'Pronto',
    description: 'Monitoreo de comandas activas y despachos'
  },
  {
    id: 'estadisticas',
    label: 'Estadísticas',
    icon: 'chart',
    route: null,
    roles: ['ADMIN', 'MANAGER'],
    enabled: false,
    badge: 'Pronto',
    description: 'Métricas de ventas, rotación y rendimiento'
  },
  {
    id: 'ajustes',
    label: 'Ajustes',
    icon: 'settings',
    route: null,
    roles: ['ADMIN'],
    enabled: false,
    badge: 'Pronto',
    description: 'Categorías de productos y métodos de pago'
  }
];
