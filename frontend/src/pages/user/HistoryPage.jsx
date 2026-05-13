import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Trash2 } from 'lucide-react';
import { api, apiError } from '../../api/client.js';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingBlock from '../../components/LoadingBlock.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function HistoryPage({ adminView = false }) {
  const [records, setRecords] = useState(null);

  function loadHistory() {
    api
      .get('/history')
      .then(({ data }) => setRecords(data.records))
      .catch((error) => toast.error(apiError(error, 'Unable to load history')));
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function deleteRecord(uploadId) {
    if (!window.confirm('Delete this analysis record? The patient will remain, and only this analysis will be removed.')) {
      return;
    }

    try {
      await api.delete(`/history/${uploadId}`);
      setRecords((current) => current.filter((record) => record.upload_id !== uploadId));
      toast.success('Analysis record deleted');
    } catch (error) {
      toast.error(apiError(error, 'Unable to delete analysis record'));
    }
  }

  if (!records) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        eyebrow={adminView ? 'Records' : 'History'}
        title={adminView ? 'All analysis records' : 'Patient analysis history'}
        description="Open previous AI results without rerunning the model."
      />
      {records.length === 0 ? (
        <EmptyState title="No history records" />
      ) : (
        <div className="panel overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3">Disease Counts</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.upload_id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{record.patient_name}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(record.upload_date).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">
                      Caries {record.disease_counts.caries}, Periapical {record.disease_counts.periapical}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-clinical-50 px-2.5 py-1 text-xs font-bold text-clinical-700">{record.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {record.result_id && (
                          <Link className="btn-secondary px-3 py-2" to={`/results/${record.result_id}`}>
                            <Eye size={16} />
                            View
                          </Link>
                        )}
                        <button className="btn-secondary px-3 py-2 text-red-600" onClick={() => deleteRecord(record.upload_id)}>
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {records.map((record) => (
              <article key={record.upload_id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-950">{record.patient_name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{new Date(record.upload_date).toLocaleString()}</p>
                  </div>
                  <span className="rounded-lg bg-clinical-50 px-2.5 py-1 text-xs font-bold text-clinical-700">{record.status}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Caries {record.disease_counts.caries} • Periapical {record.disease_counts.periapical}
                </p>
                {record.result_id && (
                  <Link className="btn-primary mt-4 w-full" to={`/results/${record.result_id}`}>
                    <Eye size={16} />
                    View Result
                  </Link>
                )}
                <button className="btn-secondary mt-3 w-full text-red-600" onClick={() => deleteRecord(record.upload_id)}>
                  <Trash2 size={16} />
                  Delete Analysis
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
