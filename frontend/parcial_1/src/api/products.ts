import type { Product, ProductCreate, ProductUpdate, ProductWithRelations } from "../types";

const BASE = "http://localhost:8000/products";

export async function fetchProducts(name?: string, category_id?: number): Promise<Product[]> {
  const url = new URL(BASE + "/");
  if (name) url.searchParams.set("name", name);
  if (category_id) url.searchParams.set("category_id", String(category_id));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Error fetching products");
  return res.json();
}

export async function fetchProduct(id: number): Promise<ProductWithRelations> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export async function createProduct(data: ProductCreate): Promise<Product> {
  const res = await fetch(BASE + "/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creating product");
  return res.json();
}

export async function updateProduct(id: number, data: ProductUpdate): Promise<Product> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error updating product");
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error deleting product");
}

export async function addCategoryToProduct(productId: number, categoryId: number): Promise<void> {
  const res = await fetch(`${BASE}/${productId}/categories/${categoryId}`, { method: "POST" });
  if (!res.ok) throw new Error("Error assigning category");
}

export async function removeCategoryFromProduct(productId: number, categoryId: number): Promise<void> {
  const res = await fetch(`${BASE}/${productId}/categories/${categoryId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error removing category");
}

export async function addIngredientToProduct(
  productId: number,
  ingredientId: number,
  isRemovable: boolean
): Promise<void> {
  const res = await fetch(`${BASE}/${productId}/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredient_id: ingredientId, is_removable: isRemovable }),
  });
  if (!res.ok) throw new Error("Error adding ingredient");
}

export async function removeIngredientFromProduct(productId: number, ingredientId: number): Promise<void> {
  const res = await fetch(`${BASE}/${productId}/ingredients/${ingredientId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error removing ingredient");
}
