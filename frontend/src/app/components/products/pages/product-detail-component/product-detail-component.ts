import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../service/product-service';
import { Product } from '../../models/product';
import { HeaderComponent } from '../../../header-component/header-component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail-component',
  imports: [HeaderComponent, FormsModule],
  templateUrl: './product-detail-component.html',
  styleUrl: './product-detail-component.css'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ProductService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly saving = signal(false);

  name = '';
  description = '';
  price = 0;
  available = true;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.getById(id).subscribe({
      next: p => {
        this.product.set(p);
        this.name = p.name;
        this.description = p.description ?? '';
        this.price = p.price;
        this.available = p.available ?? true;
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  onSave(): void {
    
  }

  onBack(): void {
    this.router.navigate(['/admin/menu']);
  }
}