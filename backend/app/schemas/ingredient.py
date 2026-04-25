from typing import Optional
from sqlmodel import SQLModel, Field


class IngredientBase(SQLModel):
    name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None)
    is_allergen: bool = Field(default=False)


class IngredientCreate(IngredientBase):
    pass


class IngredientRead(IngredientBase):
    id: int


class IngredientUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = None
    is_allergen: Optional[bool] = None
