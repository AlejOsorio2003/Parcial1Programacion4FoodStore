from .category import Category
from .ingredient import Ingredient
from .product import Product
from .product_category import ProductCategory
from .product_ingredient import ProductIngredient

# Resolve forward references ("ProductCategory", "ProductIngredient") declared in
# Category, Ingredient and Product before the link-table classes were imported.
Category.model_rebuild()
Ingredient.model_rebuild()
Product.model_rebuild()

__all__ = ["Category", "Ingredient", "Product", "ProductCategory", "ProductIngredient"]
