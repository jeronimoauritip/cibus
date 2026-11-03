import { Component, input, output, signal } from '@angular/core';
import { MenuItem, MenuItemUpdate } from '../../models/menu-item';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-menu-item-row-component',
  styleUrl: './menu-item-row-component.css',
  templateUrl: './menu-item-row-component.html',
})
export class MenuItemRowComponent {
  readonly menuItem = input.required<MenuItem>();
  
  readonly saveEdit = output<{ id: number, data: MenuItemUpdate }>();
  readonly delete = output<MenuItem>();
  
  readonly isEditing = signal(false);
  readonly confirming = signal(false);

  // Temporary draft state for inline editing
  draftPrice = 0;
  draftAvailable = false;

  onEditStart(): void {
    // Initialize form with current values
    this.draftPrice = this.menuItem().price;
    this.draftAvailable = this.menuItem().available;
    this.isEditing.set(true);
    this.confirming.set(false);
  }

  onCancelEdit(): void {
    this.isEditing.set(false);
    this.confirming.set(false);
  }

  onSave(): void {
    // Emit the update payload to the parent component
    this.saveEdit.emit({
      id: this.menuItem().id,
      data: {
        price: this.draftPrice,
        available: this.draftAvailable
      }
    });
    this.isEditing.set(false);
  }

  onDeleteRequest(): void {
    this.confirming.set(true);
  }

  onDeleteConfirm(): void {
    this.delete.emit(this.menuItem());
    this.confirming.set(false);
  }

  onDeleteCancel(): void {
    this.confirming.set(false);
  }
}
