from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.schemas.product import (
    AddIngredientToProduct,
    ProductCreate,
    ProductRead,
    ProductReadWithRelations,
    ProductUpdate,
)
from app.services import product_service
from app.uow.unit_of_work import UnitOfWork
from database import get_session

router = APIRouter(prefix="/products", tags=["Products"])

ProductId = Annotated[int, Path(ge=1, description="Product ID")]
CategoryId = Annotated[int, Path(ge=1, description="Category ID")]
IngredientId = Annotated[int, Path(ge=1, description="Ingredient ID")]
NameFilter = Annotated[str | None, Query(max_length=200, description="Filter by name")]
CategoryFilter = Annotated[int | None, Query(ge=1, description="Filter by category ID")]
OffsetParam = Annotated[int, Query(ge=0, description="Records to skip")]
LimitParam = Annotated[int, Query(ge=1, le=100, description="Max records to return")]


def get_uow(session: Session = Depends(get_session)) -> UnitOfWork:
    return UnitOfWork(session)


@router.get("/", response_model=list[ProductRead])
def list_products(
    name: NameFilter = None,
    category_id: CategoryFilter = None,
    offset: OffsetParam = 0,
    limit: LimitParam = 20,
    uow: UnitOfWork = Depends(get_uow),
):
    return product_service.get_all(uow, name, category_id, offset, limit)


@router.get("/{product_id}", response_model=ProductReadWithRelations)
def get_product(product_id: ProductId, uow: UnitOfWork = Depends(get_uow)):
    return product_service.get_by_id(uow, product_id)


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, uow: UnitOfWork = Depends(get_uow)):
    return product_service.create(uow, data)


@router.patch("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: ProductId,
    data: ProductUpdate,
    uow: UnitOfWork = Depends(get_uow),
):
    return product_service.update(uow, product_id, data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: ProductId, uow: UnitOfWork = Depends(get_uow)):
    product_service.delete(uow, product_id)


@router.post(
    "/{product_id}/categories/{category_id}",
    status_code=status.HTTP_201_CREATED,
)
def add_category_to_product(
    product_id: ProductId,
    category_id: CategoryId,
    uow: UnitOfWork = Depends(get_uow),
):
    product_service.add_category(uow, product_id, category_id)
    return {"detail": "Category assigned successfully"}


@router.delete(
    "/{product_id}/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_category_from_product(
    product_id: ProductId,
    category_id: CategoryId,
    uow: UnitOfWork = Depends(get_uow),
):
    product_service.remove_category(uow, product_id, category_id)


@router.post(
    "/{product_id}/ingredients",
    status_code=status.HTTP_201_CREATED,
)
def add_ingredient_to_product(
    product_id: ProductId,
    data: AddIngredientToProduct,
    uow: UnitOfWork = Depends(get_uow),
):
    product_service.add_ingredient(uow, product_id, data)
    return {"detail": "Ingredient added successfully"}


@router.delete(
    "/{product_id}/ingredients/{ingredient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_ingredient_from_product(
    product_id: ProductId,
    ingredient_id: IngredientId,
    uow: UnitOfWork = Depends(get_uow),
):
    product_service.remove_ingredient(uow, product_id, ingredient_id)
