import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarDays, Loader2, Search } from 'lucide-react';
import { api, apiError } from '../../api/client.js';
import ImageDropzone from '../../components/ImageDropzone.jsx';
import PageHeader from '../../components/PageHeader.jsx';

const initialForm = {
  patient_id: '',
  patient_name: '',
  age: '',
  gender: 'female',
  problem_description: '',
  reporting_date: new Date().toISOString().slice(0, 10)
};

export default function NewAnalysisPage() {
  const [form, setForm] = useState(initialForm);
  const [patients, setPatients] = useState([]);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/patients')
      .then(({ data }) => setPatients(data.patients || []))
      .catch((error) => toast.error(apiError(error, 'Unable to load patients')));
  }, []);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handlePatientSelection(patientId) {
    if (!patientId) {
      setForm((current) => ({ ...current, patient_id: '', patient_name: '', age: '', gender: 'female' }));
      return;
    }

    try {
      const { data } = await api.get(`/patients/${patientId}`);
      const patient = data.patient;

      setForm((current) => ({
        ...current,
        patient_id: patient.patient_id,
        patient_name: patient.patient_name || '',
        age: patient.age != null ? String(patient.age) : '',
        gender: patient.gender || 'female'
      }));
    } catch (error) {
      toast.error(apiError(error, 'Unable to load patient details'));
    }
  }

  async function analyze(event) {
    event.preventDefault();

    if (!file) {
      toast.error('Please upload a dental X-ray image');
      return;
    }

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    body.append('image', file);

    setProcessing(true);
    try {
      const { data } = await api.post('/analysis', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Analysis complete');
      navigate(`/results/${data.result.result_id}`);
    } catch (error) {
      toast.error(apiError(error, 'Analysis failed'));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="New analysis"
        title="Upload dental X-ray"
        description="Enter patient information and submit a panoramic or intraoral X-ray for AI-assisted disease detection."
      />

      {processing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-soft">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-clinical-50 text-clinical-600">
              <Loader2 className="animate-spin" size={30} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-950">Processing X-ray</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">The mock AI pipeline is preparing disease counts, confidences, and bounding boxes.</p>
          </div>
        </div>
      )}

      <form className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]" onSubmit={analyze}>
        <section className="panel space-y-4 p-5">
          <h2 className="text-lg font-bold text-slate-950">Patient details</h2>
          <label className="block">
            <span className="label">Select Existing Patient</span>
            <select className="field mt-1.5" value={form.patient_id} onChange={(event) => handlePatientSelection(event.target.value)}>
              <option value="">Create new patient</option>
              {patients.map((patient) => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.patient_name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Patient Name</span>
            <input
              className="field mt-1.5"
              value={form.patient_name}
              readOnly={Boolean(form.patient_id)}
              onChange={(event) => updateField('patient_name', event.target.value)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Age</span>
              <input
                className="field mt-1.5"
                type="number"
                min="1"
                readOnly={Boolean(form.patient_id)}
                value={form.age}
                onChange={(event) => updateField('age', event.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Gender</span>
              <select
                className="field mt-1.5"
                value={form.gender}
                disabled={Boolean(form.patient_id)}
                onChange={(event) => updateField('gender', event.target.value)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="label">Reporting Date</span>
            <span className="relative mt-1.5 block">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="field pl-10"
                type="date"
                value={form.reporting_date}
                onChange={(event) => updateField('reporting_date', event.target.value)}
              />
            </span>
          </label>
          <label className="block">
            <span className="label">Problem Description</span>
            <textarea
              className="field mt-1.5 min-h-32 resize-y"
              value={form.problem_description}
              onChange={(event) => updateField('problem_description', event.target.value)}
              placeholder="Symptoms, tooth region, pain history, or notes"
            />
          </label>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-950">X-ray image</h2>
          <ImageDropzone file={file} onFileChange={setFile} />
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setForm(initialForm);
                setFile(null);
              }}
            >
              Reset
            </button>
            <button className="btn-primary" disabled={processing}>
              <Search size={18} />
              Analyze
            </button>
          </div>
        </section>
      </form>
    </>
  );
}
