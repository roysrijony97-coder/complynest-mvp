from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class UserContext(BaseModel):
    user_id: str | None = None
    email: str | None = None


class TaskCreateRequest(BaseModel):
    title: str
    propertyId: str
    dueDate: str
    priority: str
    assignee: str
    notes: str
    status: str


class TaskCreateResponse(BaseModel):
    message: str
    task: dict


# Placeholder for future Supabase-authenticated user/session models.
