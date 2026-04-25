from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session

from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.services import category_service
from app.uow.unit_of_work import UnitOfWork
from database import get_session

router = APIRouter(prefix="/categories", tags=["Categories"])

CategoryId = Annotated[int, Path(ge=1, description="Category ID")]
NameFilter = Annotated[str | None, Query(max_length=100, description="Filter by name")]
OffsetParam = Annotated[int, Query(ge=0, description="Records to skip")]
LimitParam = Annotated[int, Query(ge=1, le=100, description="Max records to return")]


def get_uow(session: Session = Depends(get_session)) -> UnitOfWork:
    return UnitOfWork(session)


@router.get("/", response_model=list[CategoryRead])
def list_categories(
    name: NameFilter = None,
    offset: OffsetParam = 0,
    limit: LimitParam = 20,
    uow: UnitOfWork = Depends(get_uow),
):
    return category_service.get_all(uow, name, offset, limit)


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: CategoryId, uow: UnitOfWork = Depends(get_uow)):
    return category_service.get_by_id(uow, category_id)


@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, uow: UnitOfWork = Depends(get_uow)):
    return category_service.create(uow, data)


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: CategoryId,
    data: CategoryUpdate,
    uow: UnitOfWork = Depends(get_uow),
):
    return category_service.update(uow, category_id, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: CategoryId, uow: UnitOfWork = Depends(get_uow)):
    category_service.delete(uow, category_id)
