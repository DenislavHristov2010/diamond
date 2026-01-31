from database import Base
from sqlalchemy import Column, Integer, String, DECIMAL, Enum, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))


class Service(Base):
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True, index=True)
    category = Column(Enum('face','full_body','lower_body','top_body'), nullable=False)
    service_price = Column(DECIMAL(10,2), nullable=False)
    service_name = Column(String(100), nullable=False)
    service_description = Column(Text, nullable=False)
    service_length = Column(Integer, nullable=False)
    favourite = Column(Integer, default=0)


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    price = Column(DECIMAL(10,2), nullable=False)
    status = Column(Enum('pending','paid','cancelled','cash_on_delivery'), default='pending')
    appointment_datetime = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Cart(Base):
    __tablename__ = "cart"

    cart_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.service_id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    added_at = Column(DateTime, server_default=func.now())

    service = relationship("Service")
