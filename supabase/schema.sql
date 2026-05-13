create extension if not exists "pgcrypto";

create table if not exists users (
  user_id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists patients (
  patient_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(user_id) on delete cascade,
  patient_name text not null,
  age integer not null,
  gender text not null,
  problem_description text,
  reporting_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists uploads (
  upload_id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(patient_id) on delete cascade,
  uploaded_by uuid not null references users(user_id) on delete cascade,
  image_path text not null,
  file_name text not null,
  upload_time timestamptz not null default now()
);

create table if not exists results (
  result_id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references uploads(upload_id) on delete cascade,
  output_image_path text not null,
  processing_time text,
  run_time numeric,
  total_caries integer not null default 0,
  total_periapical integer not null default 0,
  overall_status text not null,
  is_latest boolean not null default true
);

create table if not exists detections (
  detection_id uuid primary key default gen_random_uuid(),
  result_id uuid not null references results(result_id) on delete cascade,
  disease_type text not null check (disease_type in ('caries', 'periapical')),
  count integer not null default 0
);

create table if not exists bounding_boxes (
  box_id uuid primary key default gen_random_uuid(),
  result_id uuid not null references results(result_id) on delete cascade,
  disease_type text not null check (disease_type in ('caries', 'periapical')),
  confidence_score numeric not null,
  box_color text not null,
  x_min numeric not null,
  y_min numeric not null,
  x_max numeric not null,
  y_max numeric not null
);

create index if not exists idx_patients_user_id on patients(user_id);
create index if not exists idx_uploads_uploaded_by on uploads(uploaded_by);
create index if not exists idx_uploads_patient_id on uploads(patient_id);
create index if not exists idx_results_upload_id on results(upload_id);
create index if not exists idx_detections_result_id on detections(result_id);
create index if not exists idx_bounding_boxes_result_id on bounding_boxes(result_id);
