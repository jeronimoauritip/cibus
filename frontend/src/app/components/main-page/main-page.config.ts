import { InjectionToken } from '@angular/core';

export type MainPageDataMode = 'mock' | 'api';
export type ViewerRole = 'ADMIN' | 'MANAGER';

export const MAIN_PAGE_DATA_MODE = new InjectionToken<MainPageDataMode>(
  'MAIN_PAGE_DATA_MODE',
  {
    providedIn: 'root',
    factory: () => 'mock'
  }
);

export const VIEWER_ROLE = new InjectionToken<ViewerRole>(
  'VIEWER_ROLE',
  {
    providedIn: 'root',
    factory: () => 'ADMIN'
  }
);
