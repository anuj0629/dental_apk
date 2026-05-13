# Model Files

Place real model weights here when you replace the mock AI service.

Recommended layout:

```text
backend/models/
  yolo/
    best.pt
  classifiers/
    best.pt
    hybrid_effnet_pso_results.json
    dbst4_hybrid_effnet_pso_results.json
```

The backend environment already points to:

```env
YOLO_MODEL_PATH=models/yolo/best.pt
CLASSIFIER_MODEL_DIR=models/classifiers
PSO_RESULTS_PATH=backend/models/classifiers/hybrid_effnet_pso_results.json
```

Use PSO as an offline optimizer, not as a third runtime model weight. At runtime the app should only read the tuned fusion params from the PSO output JSON:

- `yolo_threshold`
- `classifier_threshold`
- `yolo_weight`
- `classifier_weight`

If you want to display PSO information in the UI, expose `best_fitness` as a quality score rather than a weight.

Keep large weight files out of Git. The root `.gitignore` ignores common model artifacts.
