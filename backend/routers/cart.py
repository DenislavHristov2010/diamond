# routers/cart.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Cart, Service, Order, User
from database import get_db
from dependencies import get_current_user
from datetime import datetime

router = APIRouter(prefix="/cart", tags=["Cart"])

# --- Get all services ---
@router.get("/services")
def get_services(db: Session = Depends(get_db)):
    services = db.query(Service).all()
    services_details = []
    for service in services:
        services_details.append({
            "service_id": service.service_id,
            "service_name": service.service_name,
            "service_price": float(service.service_price),
            "service_length": service.service_length,
            "service_description": service.service_description,
            "category": service.category,
            "favourite": service.favourite
        })
    return {"services": services_details}

# --- Add service to cart ---
@router.post("/items/{service_id}")
def add_to_cart(service_id: int, quantity: int = 1, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    service = db.query(Service).filter(Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    cart_item = db.query(Cart).filter(Cart.user_id == user_id, Cart.service_id == service_id).first()
    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = Cart(user_id=user_id, service_id=service_id, quantity=quantity)
        db.add(cart_item)
    db.commit()
    return {"message": "Service added to cart"}

# --- View cart ---
@router.get("/")
def view_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    items = db.query(Cart).filter(Cart.user_id == user_id).all()
    cart_details = []
    for item in items:
        cart_details.append({
            "cart_id": item.cart_id,
            "service_id": item.service_id,
            "service_name": item.service.service_name,
            "service_price": float(item.service.service_price),
            "quantity": item.quantity,
            "total_price": float(item.service.service_price) * item.quantity
        })
    print(cart_details)
    return {"cart": cart_details}

# --- Remove service from cart ---
@router.delete("/items/{cart_id}")
def remove_from_cart(cart_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    cart_item = db.query(Cart).filter(Cart.cart_id == cart_id, Cart.user_id == user_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(cart_item)
    db.commit()
    return {"message": "Service removed from cart"}

# --- Checkout ---
@router.post("/checkout")
def checkout(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    items = db.query(Cart).filter(Cart.user_id == user_id).all()
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total_price = sum(float(item.service.service_price) * item.quantity for item in items)
    
    # Create order
    order = Order(user_id=user_id, price=total_price, appointment_datetime=datetime.now())
    db.add(order)
    db.commit()
    
    # Clear cart
    for item in items:
        db.delete(item)
    db.commit()
    
    return {"message": "Order created", "order_id": order.order_id, "total_price": total_price}
