import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchProduct,
  addCategoryToProduct,
  removeCategoryFromProduct,
  addIngredientToProduct,
  removeIngredientFromProduct,
} from "../api/products";
import { fetchCategories } from "../api/categories";
import { fetchIngredients } from "../api/ingredients";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const queryClient = useQueryClient();

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [isRemovable, setIsRemovable] = useState(false);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => fetchProduct(productId),
  });

  const { data: allCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });

  const { data: allIngredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: () => fetchIngredients(),
  });

  const addCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => addCategoryToProduct(productId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      setSelectedCategoryId("");
    },
  });

  const removeCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => removeCategoryFromProduct(productId, categoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product", productId] }),
  });

  const addIngredientMutation = useMutation({
    mutationFn: ({ ingredientId, isRemovable }: { ingredientId: number; isRemovable: boolean }) =>
      addIngredientToProduct(productId, ingredientId, isRemovable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      setSelectedIngredientId("");
      setIsRemovable(false);
    },
  });

  const removeIngredientMutation = useMutation({
    mutationFn: (ingredientId: number) => removeIngredientFromProduct(productId, ingredientId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product", productId] }),
  });

  const assignedCategoryIds = new Set(product?.categories.map((c) => c.id));
  const assignedIngredientIds = new Set(product?.ingredients.map((i) => i.ingredient.id));

  const availableCategories = allCategories?.filter((c) => !assignedCategoryIds.has(c.id)) ?? [];
  const availableIngredients = allIngredients?.filter((i) => !assignedIngredientIds.has(i.id)) ?? [];

  if (isLoading) return <p className="text-gray-500">Cargando producto...</p>;
  if (isError || !product) return <p className="text-red-500">Producto no encontrado.</p>;

  return (
    <div>
      <div className="mb-6">
        <Link to="/products" className="text-indigo-600 hover:underline text-sm">
          ← Volver a Productos
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            {product.description && (
              <p className="text-gray-500 mt-1">{product.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
            {product.is_available ? (
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                Disponible
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-1 rounded-full">
                Deshabilitado
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Categorías</h2>

          <ul className="mb-4 space-y-2">
            {product.categories.length === 0 && (
              <li className="text-gray-400 text-sm">Sin categorías asignadas.</li>
            )}
            {product.categories.map((cat) => (
              <li key={cat.id} className="flex justify-between items-center">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
                  {cat.name}
                </span>
                <button
                  onClick={() => removeCategoryMutation.mutate(cat.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          {availableCategories.length > 0 && (
            <div className="flex gap-2 mt-2">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Seleccionar categoría...</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (selectedCategoryId)
                    addCategoryMutation.mutate(Number(selectedCategoryId));
                }}
                disabled={!selectedCategoryId || addCategoryMutation.isPending}
                className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ingredientes</h2>

          <ul className="mb-4 space-y-2">
            {product.ingredients.length === 0 && (
              <li className="text-gray-400 text-sm">Sin ingredientes asignados.</li>
            )}
            {product.ingredients.map(({ ingredient, is_removable }) => (
              <li key={ingredient.id} className="flex justify-between items-center">
                <div>
                  <span className="text-gray-800 text-sm font-medium">{ingredient.name}</span>
                  {ingredient.is_allergen && (
                    <span className="ml-2 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded">
                      alérgeno
                    </span>
                  )}
                  {is_removable && (
                    <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded">
                      removible
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeIngredientMutation.mutate(ingredient.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>

          {availableIngredients.length > 0 && (
            <div className="space-y-2 mt-2">
              <select
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Seleccionar ingrediente...</option>
                {availableIngredients.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isRemovable}
                    onChange={(e) => setIsRemovable(e.target.checked)}
                    className="accent-indigo-600"
                  />
                  Removible por el cliente
                </label>
                <button
                  onClick={() => {
                    if (selectedIngredientId)
                      addIngredientMutation.mutate({
                        ingredientId: Number(selectedIngredientId),
                        isRemovable,
                      });
                  }}
                  disabled={!selectedIngredientId || addIngredientMutation.isPending}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
