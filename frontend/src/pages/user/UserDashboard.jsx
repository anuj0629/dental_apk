import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, UploadCloud, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../api/client.js';
import LoadingBlock from '../../components/LoadingBlock.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function UserDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/dashboard/user')
      .then(({ data }) => setStats(data))
      .catch((error) => toast.error(apiError(error, 'Unable to load dashboard')));
  }, []);

  if (!stats) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        eyebrow="User dashboard"
        title="Analysis workspace"
        description="Start a new dental X-ray analysis and review your latest patient uploads."
        action={
          <Link className="btn-primary" to="/user/analysis/new">
            <Plus size={18} />
            New Analysis
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} />
        <StatCard icon={ClipboardList} label="Total Analyses" value={stats.totalAnalyses} tone="teal" />
        <StatCard icon={UploadCloud} label="Recent Uploads" value={stats.recentUploads?.length || 0} tone="slate" />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold text-slate-950">Recent uploads</h2>
        {stats.recentUploads?.length ? (
          <div className="panel overflow-hidden">
            <div className="divide-y divide-slate-100">
              {stats.recentUploads.map((upload) => (
                <div key={upload.upload_id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{upload.file_name}</p>
                    <p className="text-sm text-slate-500">{new Date(upload.upload_time).toLocaleString()}</p>
                  </div>
                  <span className="rounded-lg bg-clinical-50 px-3 py-1 text-sm font-semibold text-clinical-700">Uploaded</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No uploads yet" message="Run your first analysis to build patient history." />
        )}
      </section>
    </>
  );
}
