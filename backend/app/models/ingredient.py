from typing import TYPE_CHECKING, List, Optional
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .product_ingredient import ProductIngredient


class Ingredient(SQLModel, table=True):
    __tablename__ = "ingredient"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None)
    is_allergen: bool = Field(default=False)

    product_ingredients: List["ProductIngredient"] = Relationship(
        back_populates="ingredient",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
