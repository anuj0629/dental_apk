# Deployment Guide

This project is already a working web prototype. The safest next step is to deploy it as 3 services:

1. `frontend` as a static web app
2. `backend` as a Node API
3. `inference` as a Python API

Supabase remains the database.

## Recommended Prototype Stack

- Frontend: Vercel or Netlify
- Backend: Render, Railway, or a VPS
- Inference: Render, Railway, or a VPS
- Database: Supabase

For a prototype, `Vercel + Render + Supabase` is the simplest path.

## Architecture

```text
Browser
  -> Frontend (Vercel/Netlify)
  -> Backend API (Render/Railway)
  -> Inference API (Render/Railway)
  -> Supabase
```

The frontend only talks to the backend.

The backend:
- handles auth and app APIs
- stores patient, upload, and result records in Supabase
- calls the inference API for predictions

The inference service:
- loads YOLO/classifier files
- reads PSO fusion params JSON
- returns normalized prediction output

## Important Prototype Caveats

### 1. Local uploads are not ideal for production

The backend currently stores uploaded and processed images in the local `uploads/` folder.

That is fine for local development, but most hosted platforms use ephemeral disk. That means uploaded files may disappear after restart/redeploy.

For the prototype, you have 2 options:

1. Accept temporary local file storage for demo use
2. Move uploads to Supabase Storage later

If you want the cleanest production-like prototype, moving uploads to cloud storage should be the next infrastructure improvement after deployment.

### 2. Model files must exist on the inference host

The inference service expects:

- `backend/models/yolo/best.pt`
- `backend/models/classifiers/best.pt`
- `backend/models/classifiers/hybrid_effnet_pso_results.json`

If you deploy inference separately, make sure those files are present in the deployed filesystem or mounted volume.

## Environment Variables

### Frontend

Set in `frontend` host:

```env
VITE_API_BASE_URL=https://your-backend-domain/api
```

### Backend

Set in `backend` host:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=8

AI_MODEL_API_URL=https://your-inference-domain
AI_MODEL_API_KEY=

PSO_RESULTS_PATH=backend/models/classifiers/hybrid_effnet_pso_results.json
YOLO_MODEL_PATH=models/yolo/best.pt
CLASSIFIER_MODEL_DIR=models/classifiers
```

Notes:
- Use `SUPABASE_SERVICE_ROLE_KEY` for backend.
- Set `FRONTEND_URL` to the exact deployed frontend origin for CORS.

### Inference

Set in `inference` host:

```env
PORT=8000
YOLO_MODEL_PATH=../backend/models/yolo/best.pt
CLASSIFIER_MODEL_PATH=../backend/models/classifiers/best.pt
PSO_RESULTS_PATH=../backend/models/classifiers/hybrid_effnet_pso_results.json
```

## Build / Start Commands

### Frontend

Install:

```bash
npm install
```

Build:

```bash
npm run build --prefix frontend
```

Publish directory:

```text
frontend/dist
```

### Backend

Install:

```bash
npm install
```

Start:

```bash
npm run start --prefix backend
```

### Inference

Install:

```bash
cd inference
pip install -r requirements.txt
```

Start:

```bash
python -m uvicorn app:app --app-dir inference --host 0.0.0.0 --port 8000
```

If your host provides a `PORT` environment variable, use:

```bash
python -m uvicorn app:app --app-dir inference --host 0.0.0.0 --port $PORT
```

On Windows PowerShell:

```powershell
python -m uvicorn app:app --app-dir inference --host 0.0.0.0 --port $env:PORT
```

## Deployment Order

1. Deploy backend
2. Deploy inference
3. Update backend `AI_MODEL_API_URL`
4. Deploy frontend with `VITE_API_BASE_URL`
5. Test full upload flow

## Verification Checklist

After deployment, confirm:

### Backend

Open:

```text
https://your-backend-domain/api/health
```

Expected:

```json
{"status":"ok","service":"dental-ai-backend"}
```

### Inference

Open:

```text
https://your-inference-domain/health
```

Confirm:
- `yolo_exists` is `true`
- `classifier_exists` is `true`
- `pso_results_exists` is `true`

### Frontend

Confirm:
- login works
- dashboard loads
- patient list loads
- new analysis can upload
- result page opens
- history shows saved records

## Best Next Improvement After Deployment

Once the prototype is live, the most valuable next infrastructure improvement is:

1. Move image storage from local `uploads/` to Supabase Storage

That will make uploads persistent across redeploys and restarts.
