import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const originalDir = path.join(process.cwd(), env.uploadDir, 'originals');
const processedDir = path.join(process.cwd(), env.uploadDir, 'processed');

for (const dir of [originalDir, processedDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, originalDir),
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${safeExt}`);
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['image/png', 'image/jpeg', 'image/jpg'];

  if (!allowed.includes(file.mimetype)) {
    return cb(new HttpError(400, 'Only PNG, JPG, and JPEG images are supported'));
  }

  return cb(null, true);
}

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  }
});

export { processedDir };
