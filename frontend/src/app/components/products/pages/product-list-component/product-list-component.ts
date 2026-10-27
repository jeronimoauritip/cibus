import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../service/product-service';
import { FiltroProducto } from '../../models/filtro-producto';
import { Product } from '../../models/product';
import { ProductCardComponent } from '../../components/product-card-component/product-card-component';
import { ProductFilterComponent } from '../../components/product-filter-component/product-filter-component';
import { HeaderComponent } from '../../../header-component/header-component';


@Component({
  imports: [ProductCardComponent, ProductFilterComponent, HeaderComponent],
  selector: 'app-product-list-component',
  styleUrl: './product-list-component.css',
  templateUrl: './product-list-component.html',
})
export class ProductListComponent {
  private readonly service= inject(ProductService);
  readonly filter= signal <FiltroProducto>({name:'',category:''});

  readonly filteredProducts = computed<Product[]>(()=>
  this.service.productos.value()
  ?.filter(p=>
    p.name.toLowerCase().includes(this.filter().name.toLowerCase())&&
    (this.filter().category===''|| p.categoryName===this.filter().category)
  )?? []
);
  readonly loading= computed(()=> this.service.productos.isLoading() );
  readonly error = computed(() => this.service.productos.error());
 }