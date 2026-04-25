from typing import List, Optional
from sqlmodel import SQLModel, Field

from .category import CategoryRead
from .ingredient import IngredientRead


class ProductBase(SQLModel):
    name: str = Field(min_length=2, max_length=150)
    description: Optional[str] = Field(default=None)
    price: float = Field(ge=0)
    stock_quantity: int = Field(ge=0, default=0)
    is_available: bool = Field(default=True)


class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    id: int


class ProductUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    stock_quantity: Optional[int] = Field(default=None, ge=0)
    is_available: Optional[bool] = None


class ProductIngredientRead(SQLModel):
    ingredient: IngredientRead
    is_removable: bool


class ProductReadWithRelations(ProductRead):
    categories: List[CategoryRead] = []
    ingredients: List[ProductIngredientRead] = []


class AddIngredientToProduct(SQLModel):
    ingredient_id: int = Field(ge=1)
    is_removable: bool = Field(default=False)
