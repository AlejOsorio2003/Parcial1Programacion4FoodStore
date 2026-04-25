from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.schemas.ingredient import IngredientCreate, IngredientRead, IngredientUpdate
from app.services import ingredient_service
from app.uow.unit_of_work import UnitOfWork
from database import get_session

router = APIRouter(prefix="/ingredients", tags=["Ingredients"])

IngredientId = Annotated[int, Path(ge=1, description="Ingredient ID")]
NameFilter = Annotated[str | None, Query(max_length=100, description="Filter by name")]
OffsetParam = Annotated[int, Query(ge=0, description="Records to skip")]
LimitParam = Annotated[int, Query(ge=1, le=100, description="Max records to return")]


def get_uow(session: Session = Depends(get_session)) -> UnitOfWork:
    return UnitOfWork(session)


@router.get("/", response_model=list[IngredientRead])
def list_ingredients(
    name: NameFilter = None,
    offset: OffsetParam = 0,
    limit: LimitParam = 20,
    uow: UnitOfWork = Depends(get_uow),
):
    return ingredient_service.get_all(uow, name, offset, limit)


@router.get("/{ingredient_id}", response_model=IngredientRead)
def get_ingredient(ingredient_id: IngredientId, uow: UnitOfWork = Depends(get_uow)):
    return ingredient_service.get_by_id(uow, ingredient_id)


@router.post("/", response_model=IngredientRead, status_code=status.HTTP_201_CREATED)
def create_ingredient(data: IngredientCreate, uow: UnitOfWork = Depends(get_uow)):
    return ingredient_service.create(uow, data)


@router.patch("/{ingredient_id}", response_model=IngredientRead)
def update_ingredient(
    ingredient_id: IngredientId,
    data: IngredientUpdate,
    uow: UnitOfWork = Depends(get_uow),
):
    return ingredient_service.update(uow, ingredient_id, data)


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingredient(ingredient_id: IngredientId, uow: UnitOfWork = Depends(get_uow)):
    ingredient_service.delete(uow, ingredient_id)
