import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchIngredients, createIngredient, updateIngredient, deleteIngredient } from "../api/ingredients";
import type { Ingredient, IngredientCreate, IngredientUpdate } from "../types";
import Modal from "../components/Modal";

interface FormState {
  name: string;
  description: string;
  is_allergen: boolean;
}

const emptyForm: FormState = { name: "", description: "", is_allergen: false };

export default function IngredientsPage() {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const { data: ingredients, isLoading, isError } = useQuery({
    queryKey: ["ingredients"],
    queryFn: () => fetchIngredients(),
  });

  const createMutation = useMutation({
    mutationFn: (data: IngredientCreate) => createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredientUpdate }) =>
      updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ingredients"] }),
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(ingredient: Ingredient) {
    setEditing(ingredient);
    setForm({
      name: ingredient.name,
      description: ingredient.description ?? "",
      is_allergen: ingredient.is_allergen,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || undefined,
      is_allergen: form.is_allergen,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <p className="text-gray-500">Cargando ingredientes...</p>;
  if (isError) return <p className="text-red-500">Error al cargar los ingredientes.</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ingredientes</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Nuevo ingrediente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Descripción</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Alérgeno</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredients?.map((ing) => (
              <tr key={ing.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{ing.id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{ing.name}</td>
                <td className="px-4 py-3 text-gray-500">{ing.description ?? "—"}</td>
                <td className="px-4 py-3">
                  {ing.is_allergen ? (
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                      Alérgeno
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => openEdit(ing)}
                    className="text-indigo-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(ing.id)}
                    className="text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {ingredients?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No hay ingredientes aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal
          title={editing ? "Editar ingrediente" : "Nuevo ingrediente"}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
                maxLength={100}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_allergen"
                checked={form.is_allergen}
                onChange={(e) => setForm({ ...form, is_allergen: e.target.checked })}
                className="w-4 h-4 accent-indigo-600"
              />
              <label htmlFor="is_allergen" className="text-sm font-medium text-gray-700">
                Es alérgeno
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : editing ? "Guardar cambios" : "Crear"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
