import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

const required = ['JWT_SECRET', 'SUPABASE_URL'];

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  supabaseKeyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 8),
  aiModelApiUrl: process.env.AI_MODEL_API_URL,
  aiModelApiKey: process.env.AI_MODEL_API_KEY,
  psoResultsPath: process.env.PSO_RESULTS_PATH
};

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
