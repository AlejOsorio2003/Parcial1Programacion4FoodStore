from sqlmodel import select

from app.models import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.uow.unit_of_work import UnitOfWork
from fastapi import HTTPException


def get_all(uow: UnitOfWork, name: str | None, offset: int, limit: int) -> list[Category]:
    statement = select(Category)
    if name:
        statement = statement.where(Category.name.icontains(name))
    return uow.session.exec(statement.offset(offset).limit(limit)).all()


def get_by_id(uow: UnitOfWork, category_id: int) -> Category:
    category = uow.session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


def create(uow: UnitOfWork, data: CategoryCreate) -> Category:
    category = Category.model_validate(data)
    uow.add(category)
    uow.commit()
    uow.refresh(category)
    return category


def update(uow: UnitOfWork, category_id: int, data: CategoryUpdate) -> Category:
    category = get_by_id(uow, category_id)
    update_data = data.model_dump(exclude_unset=True)
    category.sqlmodel_update(update_data)
    uow.add(category)
    uow.commit()
    uow.refresh(category)
    return category


def delete(uow: UnitOfWork, category_id: int) -> None:
    category = get_by_id(uow, category_id)
    uow.delete(category)
    uow.commit()
