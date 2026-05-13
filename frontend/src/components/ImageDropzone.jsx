import { useRef, useState } from 'react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';

export default function ImageDropzone({ file, onFileChange }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  function pick(nextFile) {
    if (nextFile) onFileChange(nextFile);
  }

  return (
    <div>
      <div
        className={`rounded-lg border-2 border-dashed bg-white p-4 text-center transition ${
          isDragging ? 'border-clinical-500 bg-clinical-50' : 'border-slate-200 hover:border-clinical-300'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          pick(event.dataTransfer.files?.[0]);
        }}
      >
        {preview ? (
          <div className="relative overflow-hidden rounded-lg border border-slate-100">
            <img src={preview} alt="Dental X-ray preview" className="h-72 w-full object-contain bg-slate-950" />
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg bg-white/95 p-2 text-slate-700 shadow-sm"
              onClick={() => onFileChange(null)}
              aria-label="Remove image"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="flex w-full flex-col items-center rounded-lg px-4 py-10"
            onClick={() => inputRef.current?.click()}
          >
            <span className="grid h-14 w-14 place-items-center rounded-lg bg-clinical-50 text-clinical-600">
              <ImagePlus size={28} />
            </span>
            <span className="mt-4 text-base font-bold text-slate-900">Upload dental X-ray image</span>
            <span className="mt-2 text-sm text-slate-500">Drag and drop or tap to choose PNG, JPG, or JPEG</span>
            <span className="btn-secondary mt-5">
              <UploadCloud size={18} />
              Choose Image
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={(event) => pick(event.target.files?.[0])}
      />
    </div>
  );
}
