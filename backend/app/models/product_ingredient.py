from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

from .ingredient import Ingredient
from .product import Product


class ProductIngredient(SQLModel, table=True):
    __tablename__ = "product_ingredient"

    product_id: Optional[int] = Field(
        default=None, foreign_key="product.id", primary_key=True
    )
    ingredient_id: Optional[int] = Field(
        default=None, foreign_key="ingredient.id", primary_key=True
    )
    is_removable: bool = Field(default=False)

    product: Optional[Product] = Relationship(back_populates="product_ingredients")
    ingredient: Optional[Ingredient] = Relationship(back_populates="product_ingredients")
