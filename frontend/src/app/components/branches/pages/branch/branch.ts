import { Component, inject, signal } from '@angular/core';
import { BranchService } from '../../service/branch-service';
import { Branch } from '../../models/branch.model';

@Component({
  imports: [],
  selector: 'app-branch',
  styleUrl: './branch.css',
  templateUrl: './branch.html',
})
export class BranchComponent {
  private readonly service = inject(BranchService);
  readonly errorService = signal<string>("");
  readonly branches = signal<Branch[]>([])

  ngOnInit(): void {
    this.service.findAll().subscribe({
      next: (data) => this.branches.set(data),
      error: (err) => this.errorService.set(err.message),
    });
  }

  addBranch(name: string, street: string, number: number): void {
    const branch: Branch = {
      name,
      street,
      number
    }

    this.service.create(branch).subscribe({
      next: (data) => this.branches.update(branches => [...branches, data]),
      error: (err) => this.errorService.set(err.message),
    });
  }

  updateBranch(branch: Branch): void {
    this.service.update(branch).subscribe({
      next: (data) => this.branches.update(branches => [...branches, data]),
      error: (err) => this.errorService.set(err.message),
    });
  }

  deleteBranch(branch: Branch): void {
    this.service.delete(branch).subscribe({
      next: (data) => this.branches.update(branches => [...branches, data]),
      error: (err) => this.errorService.set(err.message),
    });
  }


}

