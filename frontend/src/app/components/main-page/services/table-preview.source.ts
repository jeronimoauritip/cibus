import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { TablePreview } from '../models/table-preview.model';

export interface TablePreviewSource {
  watch(branchId: number): Observable<TablePreview[]>;
}

export const TABLE_PREVIEW_SOURCE = new InjectionToken<TablePreviewSource>(
  'TABLE_PREVIEW_SOURCE'
);
