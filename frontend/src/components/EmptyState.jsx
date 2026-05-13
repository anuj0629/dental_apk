import { ClipboardList } from 'lucide-react';

export default function EmptyState({ title = 'No records found', message = 'New records will appear here.' }) {
  return (
    <div className="panel grid place-items-center px-4 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-clinical-50 text-clinical-600">
        <ClipboardList size={22} />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{message}</p>
    </div>
  );
}
