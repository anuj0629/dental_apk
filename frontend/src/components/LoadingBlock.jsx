export default function LoadingBlock({ text = 'Loading secure clinical data...' }) {
  return (
    <div className="panel grid min-h-72 place-items-center p-8">
      <div className="text-center">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-clinical-100 border-t-clinical-600" />
        <p className="mt-4 text-sm font-semibold text-slate-600">{text}</p>
      </div>
    </div>
  );
}
