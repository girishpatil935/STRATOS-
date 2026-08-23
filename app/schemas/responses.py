"""Response schemas shared by system routes."""

from pydantic import BaseModel


class RootResponse(BaseModel):
    name: str
    status: str
    message: str


class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str
