import { ProductMetric } from "./product-metric";
import { ProductCategoryMetric } from "./product-category-metric";

export interface ProductInsight {
    mostPopularProduct: ProductMetric | null;
    lessPopularProduct: ProductMetric | null;
    mostExpensiveProduct: ProductMetric | null;
    cheapestProduct: ProductMetric | null;
    mostPopularCategory: ProductCategoryMetric | null;
    lessPopularCategory: ProductCategoryMetric | null;
}
