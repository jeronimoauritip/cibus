import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Branch } from '../models/branch.model';

@Service()
export class BranchService {
    private readonly http = inject(HttpClient)
    private readonly url = 'http://localhost:8080/api/branches'


    public findAll(): Observable<Branch[]> {
        return this.http.get<Branch[]>(this.url)
    }

    public create(branch: Branch): Observable<Branch> {
        return this.http.post<Branch>(this.url, branch)
    }

    public update(branch: Branch): Observable<Branch> {
        return this.http.put<Branch>(this.url, branch)
    }

    public delete(branch: Branch): Observable<Branch> {
        return this.http.delete<Branch>(this.url)
    }
}
