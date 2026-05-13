import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { api, apiError } from '../../api/client.js';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingBlock from '../../components/LoadingBlock.jsx';
import PageHeader from '../../components/PageHeader.jsx';

export default function PatientsPage() {
  const [patients, setPatients] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/patients'), api.get('/history')])
      .then(([patientsResponse, historyResponse]) => {
        setPatients(patientsResponse.data.patients || []);
        setHistory(historyResponse.data.records || []);
      })
      .catch((error) => toast.error(apiError(error, 'Unable to load patients')));
  }, []);

  const patientsWithCounts = useMemo(() => {
    if (!patients || !history) return [];

    return patients.map((patient) => {
      const records = history.filter((record) => record.patient_id === patient.patient_id);
      return {
        ...patient,
        analysisCount: records.length,
        latestUpload: records[0]?.upload_date || null
      };
    });
  }, [history, patients]);

  async function deletePatient(patientId) {
    if (!window.confirm('Delete this patient and all related analysis records? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/patients/${patientId}`);
      setPatients((current) => current.filter((patient) => patient.patient_id !== patientId));
      setHistory((current) => current.filter((record) => record.patient_id !== patientId));
      toast.success('Patient deleted');
    } catch (error) {
      toast.error(apiError(error, 'Unable to delete patient'));
    }
  }

  if (!patients || !history) return <LoadingBlock />;

  return (
    <>
      <PageHeader
        eyebrow="Patients"
        title="Patient list"
        description="Review saved patients, reuse them for new analyses, or remove a patient and all related reports."
        action={
          <Link className="btn-primary" to="/user/analysis/new">
            <Plus size={18} />
            New Analysis
          </Link>
        }
      />

      {patientsWithCounts.length === 0 ? (
        <EmptyState title="No patients yet" message="Create a new analysis to add your first patient." />
      ) : (
        <div className="panel overflow-hidden">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Analysis Count</th>
                  <th className="px-4 py-3">Latest Upload</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientsWithCounts.map((patient) => (
                  <tr key={patient.patient_id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{patient.patient_name}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.age}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{patient.gender}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.analysisCount}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {patient.latestUpload ? new Date(patient.latestUpload).toLocaleString() : 'No analyses yet'}
                    </td>
                    <td className="px-4 py-3">
                      <button className="btn-secondary px-3 py-2 text-red-600" onClick={() => deletePatient(patient.patient_id)}>
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {patientsWithCounts.map((patient) => (
              <article key={patient.patient_id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-950">{patient.patient_name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Age {patient.age} | <span className="capitalize">{patient.gender}</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Analyses: {patient.analysisCount}</p>
                  </div>
                </div>
                <button className="btn-secondary mt-4 w-full text-red-600" onClick={() => deletePatient(patient.patient_id)}>
                  <Trash2 size={16} />
                  Delete Patient
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
