import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  calculateChairs,
  ChairDistribution,
  TableShape,
} from '../../models/table.model';

@Component({
  selector: 'app-table-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-edit-modal.html',
  styleUrl: './table-edit-modal.css',
})
export class TableEditModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit'>('create');
  readonly tableNumber = input<number>(1);
  readonly initialShape = input<TableShape>('round');
  readonly initialCapacity = input<number>(4);

  readonly confirmConfig = output<{ shape: TableShape; capacity: number }>();
  readonly confirmCreate = this.confirmConfig;
  readonly dismissModal = output<void>();

  readonly selectedShape = signal<TableShape>('round');
  readonly capacity = signal<number>(4);
  readonly showConfirmDiscard = signal<boolean>(false);

  readonly chairs = computed<ChairDistribution>(() =>
    calculateChairs(this.selectedShape(), this.capacity())
  );

  readonly isDirty = computed(() => {
    return (
      this.selectedShape() !== this.initialShape() ||
      this.capacity() !== this.initialCapacity()
    );
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.selectedShape.set(this.initialShape());
        this.capacity.set(this.initialCapacity());
        this.showConfirmDiscard.set(false);
      }
    });
  }

  setShape(shape: TableShape): void {
    this.selectedShape.set(shape);
  }

  incrementCapacity(): void {
    if (this.capacity() < 16) {
      this.capacity.update((c) => c + 1);
    }
  }

  decrementCapacity(): void {
    if (this.capacity() > 1) {
      this.capacity.update((c) => c - 1);
    }
  }

  attemptClose(): void {
    if (this.isDirty()) {
      this.showConfirmDiscard.set(true);
    } else {
      this.dismissModal.emit();
    }
  }

  cancelDiscard(): void {
    this.showConfirmDiscard.set(false);
  }

  confirmDiscard(): void {
    this.showConfirmDiscard.set(false);
    this.dismissModal.emit();
  }

  onSubmit(): void {
    this.confirmConfig.emit({
      shape: this.selectedShape(),
      capacity: this.capacity(),
    });
  }
}
