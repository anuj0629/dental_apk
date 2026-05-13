import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env.js';

const defaultCandidates = [
  'backend/models/classifiers/hybrid_effnet_pso_results.json',
  'backend/models/classifiers/dbst4_hybrid_effnet_pso_results.json',
  'backend/models/classifiers/pso_config.json'
];

function resolveCandidates() {
  const configured = env.psoResultsPath ? [env.psoResultsPath] : [];
  return [...configured, ...defaultCandidates].map((candidate) =>
    path.isAbsolute(candidate) ? candidate : path.resolve(process.cwd(), candidate)
  );
}

function normalizeFusionConfig(raw) {
  const params = raw?.params;
  if (!params) {
    return null;
  }

  const yoloWeight = Number(params.yolo_weight);
  const classifierWeight =
    Number.isFinite(Number(params.classifier_weight)) ? Number(params.classifier_weight) : Number((1 - yoloWeight).toFixed(12));

  return {
    source: raw?.source || null,
    best_fitness: Number.isFinite(Number(raw?.best_fitness)) ? Number(raw.best_fitness) : null,
    params: {
      yolo_threshold: Number(params.yolo_threshold),
      classifier_threshold: Number(params.classifier_threshold),
      yolo_weight: yoloWeight,
      classifier_weight: classifierWeight
    }
  };
}

export async function loadFusionTuning() {
  for (const candidate of resolveCandidates()) {
    try {
      const file = await fs.readFile(candidate, 'utf8');
      const parsed = JSON.parse(file);
      const normalized = normalizeFusionConfig({ ...parsed, source: path.basename(candidate) });

      if (normalized) {
        return normalized;
      }
    } catch {
      continue;
    }
  }

  return null;
}
