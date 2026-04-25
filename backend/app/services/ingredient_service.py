from sqlmodel import select

from app.models import Ingredient
from app.schemas.ingredient import IngredientCreate, IngredientUpdate
from app.uow.unit_of_work import UnitOfWork
from fastapi import HTTPException


def get_all(uow: UnitOfWork, name: str | None, offset: int, limit: int) -> list[Ingredient]:
    statement = select(Ingredient)
    if name:
        statement = statement.where(Ingredient.name.icontains(name))
    return uow.session.exec(statement.offset(offset).limit(limit)).all()


def get_by_id(uow: UnitOfWork, ingredient_id: int) -> Ingredient:
    ingredient = uow.session.get(Ingredient, ingredient_id)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


def create(uow: UnitOfWork, data: IngredientCreate) -> Ingredient:
    ingredient = Ingredient.model_validate(data)
    uow.add(ingredient)
    uow.commit()
    uow.refresh(ingredient)
    return ingredient


def update(uow: UnitOfWork, ingredient_id: int, data: IngredientUpdate) -> Ingredient:
    ingredient = get_by_id(uow, ingredient_id)
    update_data = data.model_dump(exclude_unset=True)
    ingredient.sqlmodel_update(update_data)
    uow.add(ingredient)
    uow.commit()
    uow.refresh(ingredient)
    return ingredient


def delete(uow: UnitOfWork, ingredient_id: int) -> None:
    ingredient = get_by_id(uow, ingredient_id)
    uow.delete(ingredient)
    uow.commit()
