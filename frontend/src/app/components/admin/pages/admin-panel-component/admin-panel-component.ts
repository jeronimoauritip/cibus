import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../header-component/header-component';

@Component({
  imports: [RouterLink, HeaderComponent],
  selector: 'app-admin-panel-component',
  styleUrl: './admin-panel-component.css',
  templateUrl: './admin-panel-component.html',
})
export class AdminPanelComponent {}
