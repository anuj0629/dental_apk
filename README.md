# AI-Based Dental Disease Detection System

Full-stack responsive web app for dental X-ray upload, mock AI disease detection, role-based dashboards, and Supabase-backed patient history.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express.js, JWT, Multer
- Database: Supabase PostgreSQL
- AI integration: mock service with a clean replacement point for YOLOv8m-obb + EfficientNet-B3 + PSO

## Features

- Admin/User email-password login with role selection
- Admin dashboard with totals, user creation, user editing, password reset, records view
- User dashboard with profile, new analysis, upload preview, history, and result pages
- Dental X-ray upload with PNG/JPG/JPEG validation
- Mock AI results with disease counts, confidence scores, and red/blue bounding boxes
- Local file storage for original and processed images
- Supabase tables matching the requested schema

## Project Structure

```text
backend/
  src/
    config/
    controllers/
    middleware/
    routes/
    services/
frontend/
  src/
    api/
    components/
    pages/
    state/
supabase/
  schema.sql
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create Supabase tables:

Run `supabase/schema.sql` in the Supabase SQL editor.

3. Configure environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set these backend values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
```

For local testing, `SUPABASE_ANON_KEY` can be used instead of `SUPABASE_SERVICE_ROLE_KEY` if your Supabase table policies allow backend reads/writes.

4. Create the first admin:

After `backend/.env` is configured:

```bash
npm run create-admin --prefix backend -- "Admin Name" admin@example.com StrongPassword123
```

The app stores bcrypt hashes in the required `password` column.

5. Run the app:

```bash
npm run dev
```

This starts all three local services together:

- Inference API: `http://localhost:8000`
Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

If the Python inference service does not start, create its virtual environment first:

```bash
cd inference
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Deployment

This project is ready to be deployed as a web prototype.

Recommended setup:

- `frontend` on Vercel or Netlify
- `backend` on Render or Railway
- `inference` on Render or Railway
- `Supabase` as the database

See the full deployment guide here:

- [DEPLOYMENT.md](/C:/Users/Anuj/Documents/GitHub/DENTAL-APP/DEPLOYMENT.md:1)

## API Overview

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard/admin`
- `GET /api/dashboard/user`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/users/:id`
- `PATCH /api/users/profile`
- `POST /api/analysis`
- `GET /api/analysis/results/:id`
- `GET /api/history`
- `GET /api/patients`
- `GET /api/detections?result_id=...`
- `GET /api/bounding-boxes?result_id=...`

## Real AI Model Integration

Place model files here:

```text
backend/models/yolo/best.pt
backend/models/classifiers/
```

The Node backend is already configured to call a Python inference API at:

```env
AI_MODEL_API_URL=http://localhost:8000
```

Run the Python inference service:

```bash
cd inference
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

Health check:

```text
http://localhost:8000/health
```

Then run the full stack from the project root:

```bash
npm run dev
```

To make predictions real, replace `run_real_inference()` in `inference/app.py`. Keep the returned shape the same:

```js
{
  output_image_path,
  processing_time,
  run_time,
  total_caries,
  total_periapical,
  overall_status,
  detections,
  boundingBoxes
}
```

The upload controller already persists patients, uploads, results, detections, and bounding boxes from that normalized response.
