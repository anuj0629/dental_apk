import { useEffect, useState } from 'react';
import { Activity, ClipboardList, UploadCloud, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../api/client.js';
import LoadingBlock from '../../components/LoadingBlock.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/dashboard/admin')
      .then(({ data }) => setStats(data))
      .catch((error) => toast.error(apiError(error, 'Unable to load dashboard')));
  }, []);

  if (!stats) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        eyebrow="Admin dashboard"
        title="System overview"
        description="Monitor users, patients, uploads, and AI detections across the clinical platform."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={ClipboardList} label="Total Patients" value={stats.totalPatients} tone="teal" />
        <StatCard icon={UploadCloud} label="Total Uploads" value={stats.totalUploads} tone="slate" />
        <StatCard icon={Activity} label="Total Detections" value={stats.totalDetections} tone="red" />
      </div>
    </>
  );
}
