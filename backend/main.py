from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import medications, symptoms, health
from services.rxclass_service import preload_disease_cache


@asynccontextmanager
async def lifespan(application: FastAPI):
    await preload_disease_cache()
    yield


app = FastAPI(
    title="MedWise API",
    description="Medical medication recommendation API powered by government medical databases",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(medications.router, prefix="/medications", tags=["Medications"])
app.include_router(symptoms.router, prefix="/symptoms", tags=["Symptoms"])
