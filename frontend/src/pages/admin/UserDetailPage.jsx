import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipboardList, UploadCloud, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '../../api/client.js';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingBlock from '../../components/LoadingBlock.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';

export default function UserDetailPage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then(({ data }) => setDetail(data))
      .catch((error) => toast.error(apiError(error, 'Unable to load user details')));
  }, [id]);

  if (!detail) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        eyebrow="User detail"
        title={detail.user.name}
        description={`${detail.user.email} • ${detail.user.role}`}
        action={
          <Link className="btn-secondary" to="/admin/users">
            Back to Users
          </Link>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={UserCircle} label="Role" value={detail.user.role} tone="slate" />
        <StatCard icon={ClipboardList} label="Total Patients" value={detail.totals.patients} tone="teal" />
        <StatCard icon={UploadCloud} label="Total Uploads" value={detail.totals.uploads} />
      </div>

      <h2 className="mb-3 text-lg font-bold text-slate-950">History records</h2>
      {detail.records.length === 0 ? (
        <EmptyState title="No records for this user" />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3">Disease Detected</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.records.map((record) => (
                  <tr key={record.upload_id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{record.patient_name}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(record.upload_date).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">
                      Caries {record.disease_counts.caries}, Periapical {record.disease_counts.periapical}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{record.status}</td>
                    <td className="px-4 py-3">
                      {record.result_id && (
                        <Link className="btn-secondary px-3 py-2" to={`/results/${record.result_id}`}>
                          View Result
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
