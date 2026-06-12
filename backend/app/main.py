from uuid import UUID

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client, create_client

from app.config import get_settings
from app.models import HealthResponse, TaskCreateRequest, TaskCreateResponse


settings = get_settings()
PLACEHOLDER_USER_ID = str(UUID("c9bba0b5-a803-436c-9b6f-46de43d156fd"))


def get_supabase_client() -> Client:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise RuntimeError(
            "Supabase environment variables are missing. Set SUPABASE_URL and SUPABASE_ANON_KEY."
        )

    return create_client(settings.supabase_url, settings.supabase_anon_key)


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="ComplyNest backend API.",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/tasks", response_model=TaskCreateResponse)
def create_task(payload: TaskCreateRequest) -> TaskCreateResponse:
    try:
        supabase = get_supabase_client()

        insert_payload = {
            "property_id": payload.propertyId,
            "due_date": payload.dueDate,
            "priority": payload.priority,
            "assignee": payload.assignee,
            "notes": payload.notes,
            "title": payload.title,
            "status": payload.status,
            "user_id": PLACEHOLDER_USER_ID,
        }

        result = supabase.table("compliance_tasks").insert(insert_payload).execute()
        inserted_rows = result.data or []

        if not inserted_rows:
            raise HTTPException(status_code=500, detail="Task insert returned no data")

        return TaskCreateResponse(
            message="Task created successfully",
            task=inserted_rows[0],
        )

    except HTTPException:
        raise

    except Exception as exc:
        print("FULL ERROR:", repr(exc))
        raise HTTPException(status_code=500, detail=str(exc))