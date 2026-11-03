from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import load_manager as lm
from db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db() 
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(lm.NotFoundError)
async def handle_not_found(request, exc):
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(ValueError)
async def handle_bad_request(request, exc):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


class ApplianceIn(BaseModel):
    name: str
    wattage: int
    priority: int


@app.post("/appliances", status_code=201)
def create_appliance(body: ApplianceIn):
    return lm.register(body.name, body.wattage, body.priority)


@app.delete("/appliances/{appliance_id}")
def delete_appliance(appliance_id: int):
    return lm.delete(appliance_id)


@app.post("/appliances/{appliance_id}/on")
def turn_on_appliance(appliance_id: int):
    return lm.turn_on(appliance_id)


@app.post("/appliances/{appliance_id}/off")
def turn_off_appliance(appliance_id: int):
    return lm.turn_off(appliance_id)


@app.get("/status")
def status():
    return lm.get_status()