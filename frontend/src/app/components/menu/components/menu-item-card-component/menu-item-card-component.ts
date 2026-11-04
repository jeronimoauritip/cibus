import { Component, input } from '@angular/core';
import { MenuItem } from '../../models/menu-item';

@Component({
  imports: [],
  selector: 'app-menu-item-card-component',
  styleUrl: './menu-item-card-component.css',
  templateUrl: './menu-item-card-component.html',
})
export class MenuItemCardComponent {
  readonly menuItem = input.required<MenuItem>();
}
