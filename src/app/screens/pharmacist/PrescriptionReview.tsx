import { useEffect, useMemo, useState } from 'react';
import PharmacistSidebar from '../../components/PharmacistSidebar';
import { WireframeLayout, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import {
  createPrescriptionSignedUrl,
  getPrescriptionStatusLabel,
  loadPrescriptionsForReview,
  reviewPrescription,
  type PrescriptionRecord,
  type PrescriptionStatusFilter,
} from '../../lib/prescriptions';
import { showError, showSuccess } from '../../lib/notifications';

const statusFilterOptions: { value: PrescriptionStatusFilter; label: string }[] = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All Statuses' },
];

export default function PrescriptionReview() {
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatusFilter>('pending');
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');


  const selectedPrescription = useMemo(
    () => prescriptions.find((record) => record.id === selectedPrescriptionId) ?? prescriptions[0] ?? null,
    [prescriptions, selectedPrescriptionId],
  );

  useEffect(() => {
    void refreshPrescriptions(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedPrescription) {
      setSelectedPrescriptionId('');
      setRejectionReason('');
      return;
    }

    setSelectedPrescriptionId(selectedPrescription.id);
    setRejectionReason(selectedPrescription.rejection_reason || '');
  }, [selectedPrescription]);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  useEffect(() => {
    if (message) showSuccess(message);
  }, [message]);

  const clearAlerts = () => {
    setError('');
    setMessage('');
  };

  const refreshPrescriptions = async (filter = statusFilter) => {
    setLoading(true);
    clearAlerts();

    try {
      const records = await loadPrescriptionsForReview(filter);
      setPrescriptions(records);
      setSelectedPrescriptionId((current) => current || records[0]?.id || '');
    } catch (loadError: any) {
      setError(loadError.message || 'Could not load prescriptions for review.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = async (record: PrescriptionRecord) => {
    setOpeningFileId(record.id);
    clearAlerts();

    try {
      const signedUrl = await createPrescriptionSignedUrl(record.file_url);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (openError: any) {
      setError(openError.message || 'Could not open the prescription file.');
    } finally {
      setOpeningFileId(null);
    }
  };

  const handleReview = async (decision: 'approved' | 'rejected') => {
    if (!selectedPrescription) {
      setError('Select a prescription before saving a review.');
      return;
    }

    clearAlerts();
    setSubmitting(true);

    try {
      const reviewedRecord = await reviewPrescription({
        prescriptionId: selectedPrescription.id,
        status: decision,
        rejectionReason,
      });

      const actionLabel = decision === 'approved' ? 'approved' : 'rejected';
      setMessage(`Prescription ${actionLabel} successfully for ${reviewedRecord.customer_name}.`);

      if (statusFilter === 'pending') {
        await refreshPrescriptions('pending');
      } else {
        setPrescriptions((current) =>
          current.map((record) => (record.id === reviewedRecord.id ? reviewedRecord : record)),
        );
      }
    } catch (reviewError: any) {
      setError(reviewError.message || 'Could not save the prescription review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WireframeLayout
      sidebar={<PharmacistSidebar />}
      title="Prescription Review"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="w-56">
            <div className="mb-1 text-xs font-mono text-neutral-700">Filter by Status</div>
            <select
              className={inputClassName}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as PrescriptionStatusFilter)}
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <WireframeButton
              label={loading ? 'Refreshing...' : 'Refresh'}
              variant="secondary"
              disabled={loading}
              onClick={() => void refreshPrescriptions()}
            />
          </div>
        </div>

        {error && <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {message && <div className="border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}

        <WireframeCard title={`Prescriptions${loading ? ' (...)' : ` (${prescriptions.length})`}`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-400">
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Prescription ID</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Customer Name</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Submitted</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">File</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Status</th>
                  <th className="text-left p-3 text-xs font-mono text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((record) => {
                  const isSelected = record.id === selectedPrescription?.id;
                  const badgeClass =
                    record.status === 'approved'
                      ? 'bg-neutral-700 text-white border-neutral-900'
                      : record.status === 'rejected'
                        ? 'bg-red-700 text-white border-red-900'
                        : 'bg-amber-100 text-amber-900 border-amber-300';

                  return (
                    <tr
                      key={record.id}
                      className={`border-b border-neutral-300 ${isSelected ? 'bg-neutral-100' : ''}`}
                    >
                      <td className="p-3 text-xs font-mono text-neutral-700">{record.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-3 text-xs font-mono text-neutral-700">{record.customer_name}</td>
                      <td className="p-3 text-xs font-mono text-neutral-600">
                        {new Date(record.uploaded_at).toLocaleString()}
                      </td>
                      <td className="p-3 text-xs font-mono text-neutral-600">{record.file_name}</td>
                      <td className="p-3">
                        <div className={`inline-block border px-2 py-1 text-xs font-mono ${badgeClass}`}>
                          {getPrescriptionStatusLabel(record.status).toUpperCase()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <WireframeButton
                            label="Review"
                            variant={isSelected ? 'primary' : 'secondary'}
                            onClick={() => setSelectedPrescriptionId(record.id)}
                          />
                          <WireframeButton
                            label={openingFileId === record.id ? 'Opening...' : 'Open File'}
                            variant="secondary"
                            disabled={openingFileId === record.id}
                            onClick={() => void handleOpenFile(record)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && prescriptions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-neutral-600">
                      No prescriptions found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </WireframeCard>

        <WireframeCard title={selectedPrescription ? `Prescription Detail - ${selectedPrescription.id.slice(0, 8).toUpperCase()}` : 'Prescription Detail'}>
          {!selectedPrescription && (
            <div className="text-sm text-neutral-600">
              Select a prescription from the list to review its details.
            </div>
          )}

          {selectedPrescription && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-2 text-xs font-mono text-neutral-600">Customer Information</div>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="text-neutral-700">Name: {selectedPrescription.customer_name}</div>
                    <div className="text-neutral-700">Email: {selectedPrescription.customer_email || 'N/A'}</div>
                    <div className="text-neutral-700">
                      Submission Date: {new Date(selectedPrescription.uploaded_at).toLocaleString()}
                    </div>
                    <div className="text-neutral-700">Current Status: {getPrescriptionStatusLabel(selectedPrescription.status)}</div>
                    {selectedPrescription.reviewed_at && (
                      <div className="text-neutral-700">
                        Reviewed: {new Date(selectedPrescription.reviewed_at).toLocaleString()}
                        {selectedPrescription.reviewer_name ? ` by ${selectedPrescription.reviewer_name}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-mono text-neutral-600">Prescription File</div>
                  <div className="border-2 border-neutral-300 bg-neutral-50 p-4">
                    <div className="text-sm font-mono text-neutral-800">{selectedPrescription.file_name}</div>
                    <div className="mt-1 text-xs font-mono text-neutral-500">
                      {selectedPrescription.doctor_name ? `Doctor: ${selectedPrescription.doctor_name}` : 'Doctor name not provided'}
                    </div>
                    <div className="mt-4">
                      <WireframeButton
                        label={openingFileId === selectedPrescription.id ? 'Opening...' : 'Open Full Document'}
                        variant="secondary"
                        disabled={openingFileId === selectedPrescription.id}
                        onClick={() => void handleOpenFile(selectedPrescription)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-neutral-300 pt-4">
                <div className="mb-2 text-xs font-mono text-neutral-600">Rejection Reason</div>
                <textarea
                  className={`${inputClassName} min-h-24`}
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  placeholder="Required when rejecting a prescription."
                  disabled={submitting}
                />

                {selectedPrescription.status === 'rejected' && selectedPrescription.rejection_reason && (
                  <div className="mt-2 text-xs font-mono text-red-700">
                    Existing rejection reason: {selectedPrescription.rejection_reason}
                  </div>
                )}

                <div className="mt-4 flex gap-4">
                  <WireframeButton
                    label={submitting ? 'Saving...' : 'Approve Prescription'}
                    disabled={submitting || selectedPrescription.status === 'approved'}
                    onClick={() => void handleReview('approved')}
                  />
                  <WireframeButton
                    label={submitting ? 'Saving...' : 'Reject Prescription'}
                    variant="danger"
                    disabled={submitting}
                    onClick={() => void handleReview('rejected')}
                  />
                  <WireframeButton
                    label="Clear Reason"
                    variant="secondary"
                    disabled={submitting}
                    onClick={() => setRejectionReason('')}
                  />
                </div>
              </div>
            </div>
          )}
        </WireframeCard>
      </div>
    </WireframeLayout>
  );
}

const inputClassName =
  'w-full border-2 border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900';
