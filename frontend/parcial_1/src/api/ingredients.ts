import type { Ingredient, IngredientCreate, IngredientUpdate } from "../types";

const BASE = "http://localhost:8000/ingredients";

export async function fetchIngredients(name?: string): Promise<Ingredient[]> {
  const url = new URL(BASE + "/");
  if (name) url.searchParams.set("name", name);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Error fetching ingredients");
  return res.json();
}

export async function fetchIngredient(id: number): Promise<Ingredient> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Ingredient not found");
  return res.json();
}

export async function createIngredient(data: IngredientCreate): Promise<Ingredient> {
  const res = await fetch(BASE + "/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error creating ingredient");
  return res.json();
}

export async function updateIngredient(id: number, data: IngredientUpdate): Promise<Ingredient> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error updating ingredient");
  return res.json();
}

export async function deleteIngredient(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error deleting ingredient");
}
