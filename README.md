# ComplyNest MVP

ComplyNest is a split frontend/backend project prepared for local development and Vercel deployment.

## Project structure

```text
frontend/   # Vite + React UI
backend/    # FastAPI backend
api/        # Vercel Python entrypoint
```

## Local development

### Frontend

Install frontend dependencies:

```powershell
npm run frontend:install
```

Run the Vite frontend:

```powershell
npm run frontend:dev
```

### Backend

Run the FastAPI backend from the root:

```powershell
npm run backend:dev
```

Install backend Python dependencies into the existing virtual environment:

```powershell
npm run backend:install
```

## Build

Build the frontend:

```powershell
npm run frontend:build
```
