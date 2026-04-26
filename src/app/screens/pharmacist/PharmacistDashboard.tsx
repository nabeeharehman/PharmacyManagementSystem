import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import PharmacistSidebar from '../../components/PharmacistSidebar';
import { WireframeLayout, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import { getPrescriptionStatusLabel, loadPrescriptionsForReview, type PrescriptionRecord } from '../../lib/prescriptions';
import { showError } from '../../lib/notifications';

export default function PharmacistDashboard() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    void refreshDashboard();
  }, []);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  const pendingPrescriptions = useMemo(
    () => prescriptions.filter((record) => record.status === 'pending'),
    [prescriptions],
  );
  const approvedToday = useMemo(() => {
    const today = new Date().toDateString();
    return prescriptions.filter(
      (record) => record.status === 'approved' && record.reviewed_at && new Date(record.reviewed_at).toDateString() === today,
    );
  }, [prescriptions]);
  const rejectedToday = useMemo(() => {
    const today = new Date().toDateString();
    return prescriptions.filter(
      (record) => record.status === 'rejected' && record.reviewed_at && new Date(record.reviewed_at).toDateString() === today,
    );
  }, [prescriptions]);

  const refreshDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const records = await loadPrescriptionsForReview('all');
      setPrescriptions(records);
    } catch (loadError: any) {
      setError(loadError.message || 'Could not load pharmacist dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WireframeLayout
      sidebar={<PharmacistSidebar />}
      title="Pharmacist Dashboard"
    >
      <div className="space-y-6">
        {error && <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <div className="grid grid-cols-4 gap-4">
          <WireframeCard>
            <div className="text-center">
              <div className="mb-2 text-3xl font-mono text-neutral-800">{loading ? '...' : pendingPrescriptions.length}</div>
              <div className="text-xs font-mono text-neutral-600">Pending Prescriptions</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="mb-2 text-3xl font-mono text-neutral-800">{loading ? '...' : approvedToday.length}</div>
              <div className="text-xs font-mono text-neutral-600">Approved Today</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="mb-2 text-3xl font-mono text-neutral-800">{loading ? '...' : rejectedToday.length}</div>
              <div className="text-xs font-mono text-neutral-600">Rejected Today</div>
            </div>
          </WireframeCard>
          <WireframeCard>
            <div className="text-center">
              <div className="mb-2 text-3xl font-mono text-neutral-800">{loading ? '...' : prescriptions.length}</div>
              <div className="text-xs font-mono text-neutral-600">Total Reviews</div>
            </div>
          </WireframeCard>
        </div>

        <div className="flex gap-3">
          <WireframeButton
            label={loading ? 'Refreshing...' : 'Refresh Dashboard'}
            variant="secondary"
            disabled={loading}
            onClick={() => void refreshDashboard()}
          />
          <WireframeButton
            label="Open Review Queue"
            onClick={() => navigate('/pharmacist/prescription-review')}
          />
        </div>

        <WireframeCard title="Recent Prescription Submissions">
          <div className="space-y-2">
            {!loading && prescriptions.length === 0 && (
              <div className="text-sm text-neutral-600">No prescription submissions are available yet.</div>
            )}

            {prescriptions.slice(0, 5).map((record) => (
              <div key={record.id} className="flex justify-between items-center border-2 border-neutral-300 p-3">
                <div>
                  <div className="text-sm font-mono text-neutral-800">{record.customer_name}</div>
                  <div className="text-xs font-mono text-neutral-600">Prescription ID: {record.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-xs font-mono text-neutral-500">
                    Submitted: {new Date(record.uploaded_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="border-2 border-neutral-600 bg-neutral-200 px-3 py-1 text-xs font-mono">
                    {getPrescriptionStatusLabel(record.status).toUpperCase()}
                  </div>
                  <WireframeButton
                    label="Review"
                    variant="secondary"
                    onClick={() => navigate('/pharmacist/prescription-review')}
                  />
                </div>
              </div>
            ))}
          </div>
        </WireframeCard>
      </div>
    </WireframeLayout>
  );
}
