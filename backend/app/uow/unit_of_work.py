from sqlmodel import Session, SQLModel


class UnitOfWork:
    def __init__(self, session: Session):
        self.session = session

    def add(self, entity: SQLModel) -> None:
        self.session.add(entity)

    def delete(self, entity: SQLModel) -> None:
        self.session.delete(entity)

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()

    def refresh(self, entity: SQLModel) -> None:
        self.session.refresh(entity)
