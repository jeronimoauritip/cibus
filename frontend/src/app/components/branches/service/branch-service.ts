import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Branch } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
    private readonly http = inject(HttpClient)
    private readonly url = '/api/branches'


    public findAll(): Observable<Branch[]> {
        return this.http.get<Branch[]>(this.url);
    }

    public findById(id: number): Observable<Branch> {
        return this.http.get<Branch>(`${this.url}/${id}`);
    }

    public create(branch: Branch): Observable<Branch> {
        return this.http.post<Branch>(this.url, branch);
    }

    public update(branch: Branch): Observable<Branch> {
        return this.http.put<Branch>(`${this.url}/${branch.id}`, branch);
    }

    public delete(branchOrId: Branch | number): Observable<void> {
        const id = typeof branchOrId === 'number' ? branchOrId : branchOrId.id;
        return this.http.delete<void>(`${this.url}/${id}`);
    }
}
