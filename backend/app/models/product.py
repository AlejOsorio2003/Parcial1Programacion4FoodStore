from typing import TYPE_CHECKING, List, Optional
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .product_category import ProductCategory
    from .product_ingredient import ProductIngredient


class Product(SQLModel, table=True):
    __tablename__ = "product"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(min_length=2, max_length=150)
    description: Optional[str] = Field(default=None)
    price: float = Field(ge=0)
    stock_quantity: int = Field(ge=0, default=0)
    is_available: bool = Field(default=True)

    product_categories: List["ProductCategory"] = Relationship(
        back_populates="product",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    product_ingredients: List["ProductIngredient"] = Relationship(
        back_populates="product",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
