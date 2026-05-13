import os
import random
import shutil
import time
import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
PROCESSED_DIR = PROJECT_ROOT / "backend" / "uploads" / "processed"

YOLO_MODEL_PATH = Path(os.getenv("YOLO_MODEL_PATH", PROJECT_ROOT / "backend" / "models" / "yolo" / "best.pt"))
CLASSIFIER_MODEL_PATH = Path(
    os.getenv("CLASSIFIER_MODEL_PATH", PROJECT_ROOT / "backend" / "models" / "classifiers" / "best.pt")
)
PSO_RESULTS_PATH = Path(
    os.getenv(
        "PSO_RESULTS_PATH",
        PROJECT_ROOT / "backend" / "models" / "classifiers" / "hybrid_effnet_pso_results.json",
    )
)

app = FastAPI(title="Dental AI Inference API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_fusion_tuning() -> dict[str, Any] | None:
    candidates = [
        PSO_RESULTS_PATH,
        PROJECT_ROOT / "backend" / "models" / "classifiers" / "dbst4_hybrid_effnet_pso_results.json",
        PROJECT_ROOT / "backend" / "models" / "classifiers" / "pso_config.json",
    ]

    for candidate in candidates:
        try:
            with candidate.open("r", encoding="utf-8") as file:
                raw = json.load(file)

            params = raw.get("params")
            if not params:
                continue

            yolo_weight = float(params["yolo_weight"])
            classifier_weight = float(params.get("classifier_weight", 1 - yolo_weight))

            return {
                "source": candidate.name,
                "best_fitness": raw.get("best_fitness"),
                "params": {
                    "yolo_threshold": float(params["yolo_threshold"]),
                    "classifier_threshold": float(params["classifier_threshold"]),
                    "yolo_weight": yolo_weight,
                    "classifier_weight": classifier_weight,
                },
            }
        except (FileNotFoundError, KeyError, TypeError, ValueError, json.JSONDecodeError):
            continue

    return None


@app.get("/health")
def health() -> dict[str, Any]:
    fusion_tuning = load_fusion_tuning()
    return {
        "status": "ok",
        "service": "dental-ai-inference",
        "models": {
            "yolo_exists": YOLO_MODEL_PATH.exists(),
            "classifier_exists": CLASSIFIER_MODEL_PATH.exists(),
            "pso_results_exists": fusion_tuning is not None,
        },
        "fusion_tuning": fusion_tuning,
    }


def mock_inference(output_path: Path, start: float) -> dict[str, Any]:
    caries_confidence = round(random.uniform(0.9, 0.97), 2)
    lesion_confidence = round(random.uniform(0.86, 0.95), 2)

    bounding_boxes = [
        {
            "disease_type": "caries",
            "confidence_score": caries_confidence,
            "box_color": "#ef4444",
            "x_min": 18,
            "y_min": 26,
            "x_max": 38,
            "y_max": 48,
        },
        {
            "disease_type": "periapical",
            "confidence_score": lesion_confidence,
            "box_color": "#2563eb",
            "x_min": 58,
            "y_min": 42,
            "x_max": 80,
            "y_max": 67,
        },
    ]

    detections = [
        {"disease_type": "caries", "count": 1},
        {"disease_type": "periapical", "count": 1},
    ]

    elapsed = time.time() - start
    elapsed_ms = round(elapsed * 1000)
    return {
        "output_image_path": f"/uploads/processed/{output_path.name}",
        "processing_time": elapsed_ms,
        "run_time": round(elapsed, 2),
        "total_caries": 1,
        "total_periapical": 1,
        "overall_status": "Disease detected",
        "detections": detections,
        "boundingBoxes": bounding_boxes,
        "fusion_tuning": load_fusion_tuning(),
    }


def run_real_inference(input_path: Path, output_path: Path, start: float) -> dict[str, Any]:
    """
    Replace this function with the real pipeline:

    1. Load YOLOv8 OBB model from YOLO_MODEL_PATH.
    2. Detect candidate dental disease regions.
    3. Crop/normalize each candidate region.
    4. Run EfficientNet-B3 classifier.
    5. Apply PSO-tuned fusion params from the results JSON if needed.
    6. Draw bounding boxes onto output_path.
    7. Return the normalized response shape used by Node.
    """
    shutil.copyfile(input_path, output_path)
    return mock_inference(output_path, start)


@app.post("/predict")
async def predict(image: UploadFile = File(...)) -> dict[str, Any]:
    start = time.time()
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    suffix = Path(image.filename or "xray.jpg").suffix or ".jpg"
    input_path = PROCESSED_DIR / f"inference-input-{int(start * 1000)}{suffix}"
    output_path = PROCESSED_DIR / f"inference-output-{int(start * 1000)}{suffix}"

    with input_path.open("wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    return run_real_inference(input_path, output_path, start)
