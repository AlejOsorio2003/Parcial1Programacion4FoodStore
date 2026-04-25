from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

from .category import Category
from .product import Product


class ProductCategory(SQLModel, table=True):
    __tablename__ = "product_category"

    product_id: Optional[int] = Field(
        default=None, foreign_key="product.id", primary_key=True
    )
    category_id: Optional[int] = Field(
        default=None, foreign_key="category.id", primary_key=True
    )
    is_primary: bool = Field(default=False)

    product: Optional[Product] = Relationship(back_populates="product_categories")
    category: Optional[Category] = Relationship(back_populates="product_categories")
