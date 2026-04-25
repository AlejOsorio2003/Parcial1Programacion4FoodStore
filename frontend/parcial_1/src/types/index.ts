export interface Category {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
}

export interface Ingredient {
  id: number;
  name: string;
  description: string | null;
  is_allergen: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_available: boolean;
}

export interface ProductIngredientRead {
  ingredient: Ingredient;
  is_removable: boolean;
}

export interface ProductWithRelations extends Product {
  categories: Category[];
  ingredients: ProductIngredientRead[];
}

export interface CategoryCreate {
  name: string;
  description?: string;
  parent_id?: number | null;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  parent_id?: number | null;
}

export interface IngredientCreate {
  name: string;
  description?: string;
  is_allergen: boolean;
}

export interface IngredientUpdate {
  name?: string;
  description?: string;
  is_allergen?: boolean;
}

export interface ProductCreate {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  is_available: boolean;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock_quantity?: number;
  is_available?: boolean;
}
