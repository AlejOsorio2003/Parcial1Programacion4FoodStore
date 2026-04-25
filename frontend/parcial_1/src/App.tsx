import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import CategoriesPage from "./pages/CategoriesPage";
import IngredientsPage from "./pages/IngredientsPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";

function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded font-medium transition-colors ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex gap-2 items-center">
      <span className="font-bold text-indigo-700 text-lg mr-4">Food Store</span>
      <NavLink to="/categories" className={linkClass}>Categorías</NavLink>
      <NavLink to="/ingredients" className={linkClass}>Ingredientes</NavLink>
      <NavLink to="/products" className={linkClass}>Productos</NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
