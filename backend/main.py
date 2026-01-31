from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import Base, engine
import os
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from routers import cart
# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Absolute path to frontend folder
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

# Mount static files
app.mount("/static", StaticFiles(directory=frontend_path), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth.router, prefix="/api", tags=["auth"])

# Include cart router
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])


# Serve index.html at the root
@app.get("/")
def root():
    return FileResponse(os.path.join(frontend_path, "index.html"))

@app.get("/login")
def login_page():
    return FileResponse(os.path.join(frontend_path, "login.html"))

# Serve register.html
@app.get("/register")
def register_page():
    return FileResponse(os.path.join(frontend_path, "register.html"))

@app.get("/cart")
def cart_page():
    return FileResponse(os.path.join(frontend_path, "cart.html"))
