from fastapi import FastAPI
from .routers import router
import uvicorn

app = FastAPI(title="Vendex")

app.include_router(router)

@app.get("/")
def home():
    return {"message": "Welcome to Vendex"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)