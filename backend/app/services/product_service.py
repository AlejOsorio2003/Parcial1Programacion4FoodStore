from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.models import Category, Ingredient, Product, ProductCategory, ProductIngredient
from app.schemas.category import CategoryRead
from app.schemas.ingredient import IngredientRead
from app.schemas.product import (
    AddIngredientToProduct,
    ProductCreate,
    ProductIngredientRead,
    ProductReadWithRelations,
    ProductUpdate,
)
from app.uow.unit_of_work import UnitOfWork
from fastapi import HTTPException


def _load_with_relations(uow: UnitOfWork, product_id: int) -> Product:
    statement = (
        select(Product)
        .options(
            selectinload(Product.product_categories).selectinload(ProductCategory.category),
            selectinload(Product.product_ingredients).selectinload(ProductIngredient.ingredient),
        )
        .where(Product.id == product_id)
    )
    product = uow.session.exec(statement).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def _to_read_with_relations(product: Product) -> ProductReadWithRelations:
    return ProductReadWithRelations(
        id=product.id,
        name=product.name,
        price=product.price,
        description=product.description,
        is_available=product.is_available,
        categories=[
            CategoryRead.model_validate(pc.category)
            for pc in product.product_categories
            if pc.category
        ],
        ingredients=[
            ProductIngredientRead(
                ingredient=IngredientRead.model_validate(pi.ingredient),
                is_removable=pi.is_removable,
            )
            for pi in product.product_ingredients
            if pi.ingredient
        ],
    )


def get_all(
    uow: UnitOfWork,
    name: str | None,
    category_id: int | None,
    offset: int,
    limit: int,
) -> list[Product]:
    statement = select(Product)
    if name:
        statement = statement.where(Product.name.icontains(name))
    if category_id:
        statement = statement.join(ProductCategory).where(
            ProductCategory.category_id == category_id
        )
    return uow.session.exec(statement.offset(offset).limit(limit)).all()


def get_by_id(uow: UnitOfWork, product_id: int) -> ProductReadWithRelations:
    product = _load_with_relations(uow, product_id)
    return _to_read_with_relations(product)


def create(uow: UnitOfWork, data: ProductCreate) -> Product:
    product = Product.model_validate(data)
    uow.add(product)
    uow.commit()
    uow.refresh(product)
    return product


def update(uow: UnitOfWork, product_id: int, data: ProductUpdate) -> Product:
    product = uow.session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = data.model_dump(exclude_unset=True)
    product.sqlmodel_update(update_data)
    uow.add(product)
    uow.commit()
    uow.refresh(product)
    return product


def delete(uow: UnitOfWork, product_id: int) -> None:
    product = uow.session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    uow.delete(product)
    uow.commit()


def add_category(uow: UnitOfWork, product_id: int, category_id: int) -> None:
    if not uow.session.get(Product, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    if not uow.session.get(Category, category_id):
        raise HTTPException(status_code=404, detail="Category not found")

    existing = uow.session.exec(
        select(ProductCategory).where(
            ProductCategory.product_id == product_id,
            ProductCategory.category_id == category_id,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already assigned to this product")

    uow.add(ProductCategory(product_id=product_id, category_id=category_id))
    uow.commit()


def remove_category(uow: UnitOfWork, product_id: int, category_id: int) -> None:
    link = uow.session.exec(
        select(ProductCategory).where(
            ProductCategory.product_id == product_id,
            ProductCategory.category_id == category_id,
        )
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="This category is not assigned to the product")
    uow.delete(link)
    uow.commit()


def add_ingredient(uow: UnitOfWork, product_id: int, data: AddIngredientToProduct) -> None:
    if not uow.session.get(Product, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    if not uow.session.get(Ingredient, data.ingredient_id):
        raise HTTPException(status_code=404, detail="Ingredient not found")

    existing = uow.session.exec(
        select(ProductIngredient).where(
            ProductIngredient.product_id == product_id,
            ProductIngredient.ingredient_id == data.ingredient_id,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ingredient already added to this product")

    uow.add(
        ProductIngredient(
            product_id=product_id,
            ingredient_id=data.ingredient_id,
            is_removable=data.is_removable,
        )
    )
    uow.commit()


def remove_ingredient(uow: UnitOfWork, product_id: int, ingredient_id: int) -> None:
    link = uow.session.exec(
        select(ProductIngredient).where(
            ProductIngredient.product_id == product_id,
            ProductIngredient.ingredient_id == ingredient_id,
        )
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="This ingredient is not part of the product")
    uow.delete(link)
    uow.commit()
