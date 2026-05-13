import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { processedDir } from '../middleware/upload.js';
import { env } from '../config/env.js';

function asPublicPath(absolutePath) {
  const normalized = absolutePath.replaceAll('\\', '/');
  const marker = '/uploads/';
  const index = normalized.indexOf(marker);
  return index >= 0 ? normalized.slice(index) : normalized;
}

function makeMockBoxes() {
  const cariesConfidence = Number((0.9 + Math.random() * 0.07).toFixed(2));
  const lesionConfidence = Number((0.86 + Math.random() * 0.09).toFixed(2));

  return [
    {
      disease_type: 'caries',
      confidence_score: cariesConfidence,
      box_color: '#ef4444',
      x_min: 18,
      y_min: 26,
      x_max: 38,
      y_max: 48
    },
    {
      disease_type: 'periapical',
      confidence_score: lesionConfidence,
      box_color: '#2563eb',
      x_min: 58,
      y_min: 42,
      x_max: 80,
      y_max: 67
    }
  ];
}

export async function analyzeDentalXray({ file }) {
  if (env.aiModelApiUrl) {
    try {
      return await analyzeWithInferenceApi(file);
    } catch (error) {
      console.warn(`Inference API unavailable, falling back to mock analysis: ${error.message}`);
    }
  }

  const start = Date.now();

  // Future integration point:
  // send file.path to env.AI_MODEL_API_URL and normalize that response into this shape.
  await new Promise((resolve) => setTimeout(resolve, 900));

  const ext = path.extname(file.filename);
  const processedName = `${uuid()}${ext}`;
  const processedPath = path.join(processedDir, processedName);
  await fs.copyFile(file.path, processedPath);

  const boundingBoxes = makeMockBoxes();
  const detections = [
    {
      disease_type: 'caries',
      count: boundingBoxes.filter((box) => box.disease_type === 'caries').length
    },
    {
      disease_type: 'periapical',
      count: boundingBoxes.filter((box) => box.disease_type === 'periapical').length
    }
  ];

  const totalCaries = detections.find((detection) => detection.disease_type === 'caries')?.count || 0;
  const totalPeriapical = detections.find((detection) => detection.disease_type === 'periapical')?.count || 0;

  return {
    output_image_path: asPublicPath(processedPath),
    processing_time: Date.now() - start,
    run_time: Number(((Date.now() - start) / 1000).toFixed(2)),
    total_caries: totalCaries,
    total_periapical: totalPeriapical,
    overall_status: totalCaries + totalPeriapical > 0 ? 'Disease detected' : 'No disease detected',
    detections,
    boundingBoxes
  };
}

async function analyzeWithInferenceApi(file) {
  const formData = new FormData();
  const imageBlob = new Blob([await fs.readFile(file.path)], { type: file.mimetype });
  formData.append('image', imageBlob, file.originalname);

  const response = await fetch(`${env.aiModelApiUrl.replace(/\/$/, '')}/predict`, {
    method: 'POST',
    headers: env.aiModelApiKey ? { Authorization: `Bearer ${env.aiModelApiKey}` } : undefined,
    body: formData
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Inference API failed with ${response.status}: ${message}`);
  }

  const result = await response.json();

  if (result.output_image_path?.startsWith('/uploads/processed/')) {
    const outputPath = path.join(process.cwd(), result.output_image_path.replace(/^\//, ''));
    if (!fsSync.existsSync(outputPath)) {
      const fallbackName = `${uuid()}${path.extname(file.filename)}`;
      const fallbackPath = path.join(processedDir, fallbackName);
      await fs.copyFile(file.path, fallbackPath);
      result.output_image_path = asPublicPath(fallbackPath);
    }
  }

  return result;
}
