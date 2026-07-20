from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.database.session import engine, Base
from app.api.routes import chat, documents, history, feedback, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Insurance AI Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def root():
    return FileResponse("templates/index.html")
