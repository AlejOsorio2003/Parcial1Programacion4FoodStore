from typing import Optional
from sqlmodel import SQLModel, Field


class CategoryBase(SQLModel):
    name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None)
    parent_id: Optional[int] = Field(default=None, ge=1)


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int


class CategoryUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[int] = Field(default=None, ge=1)
