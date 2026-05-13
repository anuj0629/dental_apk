export default function StatCard({ icon: Icon, label, value, tone = 'blue' }) {
  const tones = {
    blue: 'bg-clinical-50 text-clinical-600',
    red: 'bg-red-50 text-red-600',
    teal: 'bg-cyan-50 text-cyan-700',
    slate: 'bg-slate-100 text-slate-700'
  };

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value ?? 0}</p>
        </div>
        {Icon && (
          <div className={`grid h-12 w-12 place-items-center rounded-lg ${tones[tone] || tones.blue}`}>
            <Icon size={23} />
          </div>
        )}
      </div>
    </div>
  );
}
