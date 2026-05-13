import { assetUrl } from '../api/client.js';

export default function ResultImage({ title, path, boxes = [], showBoxes = false }) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>
      <div className="relative aspect-[4/3] bg-slate-950">
        {path ? (
          <img src={assetUrl(path)} alt={title} className="h-full w-full object-contain" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-300">Image unavailable</div>
        )}
        {showBoxes &&
          boxes.map((box) => (
            <div
              key={box.box_id}
              className="absolute rounded-md border-2"
              style={{
                borderColor: box.box_color,
                left: `${box.x_min}%`,
                top: `${box.y_min}%`,
                width: `${box.x_max - box.x_min}%`,
                height: `${box.y_max - box.y_min}%`
              }}
            >
              <span
                className="absolute left-0 top-0 -translate-y-full rounded-t-md px-2 py-1 text-[11px] font-bold uppercase text-white"
                style={{ backgroundColor: box.box_color }}
              >
                {box.disease_type} {Math.round(box.confidence_score * 100)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
