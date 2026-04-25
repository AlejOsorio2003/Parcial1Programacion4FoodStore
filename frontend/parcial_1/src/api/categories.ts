import type { Category, CategoryCreate, CategoryUpdate } from "../types";

const BASE = "http://localhost:8000/categories";

export async function fetchCategories(name?: string): Promise<Category[]> {
  const url = new URL(BASE + "/");
  if (name) url.searchParams.set("name", name);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Error fetching categories");
  return res.json();
}

export async function fetchCategory(id: number): Promise<Category> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Category not found");
  return res.json();
}

export async function createCategory(data: CategoryCreate): Promise<Category> {
  const res = await fetch(BASE + "/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creating category");
  return res.json();
}

export async function updateCategory(id: number, data: CategoryUpdate): Promise<Category> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error updating category");
  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error deleting category");
}
