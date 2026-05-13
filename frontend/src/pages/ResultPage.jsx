import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, History, RotateCcw } from 'lucide-react';
import { api, apiError, assetUrl } from '../api/client.js';
import LoadingBlock from '../components/LoadingBlock.jsx';
import ResultImage from '../components/ResultImage.jsx';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get(`/analysis/results/${id}`)
      .then((response) => setData(response.data))
      .catch((error) => toast.error(apiError(error, 'Unable to load result')));
  }, [id]);

  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-clinical-50 to-slate-100 p-4 sm:p-6 lg:p-8">
        <LoadingBlock />
      </main>
    );
  }

  const totalDetections = data.result.total_caries + data.result.total_periapical;
  const dashboardPath = user.role === 'admin' ? '/admin' : '/user';
  const historyPath = user.role === 'admin' ? '/admin/records' : '/user/history';
  const fusionTuning = data.fusion_tuning;
  const processingTime =
    typeof data.result.processing_time === 'number' ? `${data.result.processing_time}ms` : data.result.processing_time;

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-clinical-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button className="btn-secondary mb-4" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
              Back
            </button>
            <p className="text-xs font-bold uppercase tracking-wide text-clinical-600">AI result</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{data.patient.patient_name}</h1>
            <p className="mt-2 text-sm text-slate-600">
              Reported on {new Date(data.patient.reporting_date).toLocaleDateString()} • Processed in {data.result.processing_time}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a className="btn-secondary" href={assetUrl(data.result.output_image_path)} download>
              <Download size={18} />
              Download Result
            </a>
            <Link className="btn-secondary" to={historyPath}>
              <History size={18} />
              View History
            </Link>
            <Link className="btn-primary" to="/user/analysis/new">
              <RotateCcw size={18} />
              Run Again
            </Link>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Caries" value={data.result.total_caries} tone="red" />
          <StatCard label="Periapical Lesions" value={data.result.total_periapical} />
          <StatCard label="Total Detections" value={totalDetections} tone="teal" />
          <StatCard label="Overall Status" value={data.result.overall_status} tone="slate" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ResultImage title="Original image" path={data.upload.image_path} />
          <ResultImage title="Processed output image" path={data.result.output_image_path} boxes={data.bounding_boxes} showBoxes />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          {fusionTuning ? (
            <section className="panel p-5 xl:col-span-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">PSO-tuned fusion parameters</h2>
                  <p className="text-sm text-slate-600">
                    Offline-optimized thresholds and fusion weights from {fusionTuning.source}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  Best fitness: {fusionTuning.best_fitness?.toFixed(4) ?? 'N/A'}
                </p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="YOLO Threshold" value={fusionTuning.params.yolo_threshold.toFixed(3)} tone="teal" />
                <StatCard
                  label="Classifier Threshold"
                  value={fusionTuning.params.classifier_threshold.toFixed(3)}
                  tone="slate"
                />
                <StatCard label="YOLO Weight" value={fusionTuning.params.yolo_weight.toFixed(3)} tone="red" />
                <StatCard
                  label="Classifier Weight"
                  value={fusionTuning.params.classifier_weight.toFixed(3)}
                  tone="slate"
                />
              </div>
            </section>
          ) : null}

          <section className="panel p-5">
            <h2 className="text-lg font-bold text-slate-950">Confidence details</h2>
            <div className="mt-4 space-y-3">
              {data.bounding_boxes.map((box) => (
                <div key={box.box_id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold capitalize text-slate-700">{box.disease_type}</span>
                    <span className="font-bold text-slate-950">{Math.round(box.confidence_score * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(box.confidence_score * 100)}%`,
                        backgroundColor: box.box_color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-950">Bounding box details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Disease Type</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Coordinates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.bounding_boxes.map((box) => (
                    <tr key={box.box_id}>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-semibold capitalize text-slate-900">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: box.box_color }} />
                          {box.disease_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{Math.round(box.confidence_score * 100)}%</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        ({box.x_min}, {box.y_min}) - ({box.x_max}, {box.y_max})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="mt-6">
          <Link className="btn-secondary" to={dashboardPath}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
