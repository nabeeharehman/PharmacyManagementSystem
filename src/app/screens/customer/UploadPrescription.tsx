import { useEffect, useRef, useState } from 'react';
import CustomerSidebar from '../../components/CustomerSidebar';
import { WireframeLayout, WireframeButton, WireframeCard } from '../../components/WireframeLayout';
import {
  createPrescriptionSignedUrl,
  getPrescriptionStatusLabel,
  loadCurrentCustomerPrescriptions,
  uploadPrescription,
  type PrescriptionRecord,
} from '../../lib/prescriptions';
import { showError, showSuccess } from '../../lib/notifications';

export default function UploadPrescription() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    void refreshPrescriptions();
  }, []);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  useEffect(() => {
    if (message) showSuccess(message);
  }, [message]);

  const refreshPrescriptions = async () => {
    setLoading(true);

    try {
      const records = await loadCurrentCustomerPrescriptions();
      setPrescriptions(records);
    } catch (loadError: any) {
      setError(loadError.message || 'Could not load your prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  const clearAlerts = () => {
    setError('');
    setMessage('');
  };

  const handleUpload = async () => {
    clearAlerts();

    if (!selectedFile) {
      setError('Choose a prescription file before clicking upload.');
      return;
    }

    setUploading(true);

    try {
      const record = await uploadPrescription(selectedFile);
      setPrescriptions((current) => [record, ...current]);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setMessage('Prescription uploaded successfully. It is now waiting for pharmacist review.');
    } catch (uploadError: any) {
      setError(uploadError.message || 'Prescription upload failed.');
    } finally {
      setUploading(false);
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

  return (
    <WireframeLayout
      sidebar={<CustomerSidebar />}
      title="Upload Prescription"
    >
      <div className="space-y-6">
        <WireframeCard title="Upload New Prescription">
          <div className="space-y-4">
            <div className="border-4 border-dashed border-neutral-400 bg-neutral-50 p-8">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="w-full text-sm text-neutral-700"
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] ?? null);
                  clearAlerts();
                }}
              />
              <div className="mt-3 text-xs font-mono text-neutral-500">
                Supported formats: PDF, JPG, PNG. Maximum size: 10 MB.
              </div>
              <div className="mt-2 text-xs font-mono text-neutral-700">
                Selected file: {selectedFile ? `${selectedFile.name} (${Math.ceil(selectedFile.size / 1024)} KB)` : 'No file selected'}
              </div>
            </div>

            {error && <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            {message && <div className="border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}

            <div className="flex gap-3">
              <WireframeButton
                label={uploading ? 'Uploading...' : 'Upload Prescription'}
                className="w-full"
                disabled={uploading}
                onClick={() => void handleUpload()}
              />
              <WireframeButton
                label={loading ? 'Refreshing...' : 'Refresh List'}
                variant="secondary"
                disabled={loading || uploading}
                onClick={() => void refreshPrescriptions()}
              />
            </div>
          </div>
        </WireframeCard>

        <WireframeCard title={`Prescription Status${loading ? ' (...)' : ` (${prescriptions.length})`}`}>
          <div className="space-y-3">
            {!loading && prescriptions.length === 0 && (
              <div className="border-2 border-neutral-300 bg-white p-4 text-sm text-neutral-600">
                No prescriptions uploaded yet. Upload your first prescription to start the approval process.
              </div>
            )}

            {prescriptions.map((record) => {
              const badgeClass =
                record.status === 'approved'
                  ? 'bg-neutral-700 text-white border-neutral-900'
                  : record.status === 'rejected'
                    ? 'bg-red-700 text-white border-red-900'
                    : 'bg-amber-100 text-amber-900 border-amber-300';

              return (
                <div key={record.id} className="border-2 border-neutral-400 p-4">
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-mono text-neutral-700 mb-1">Prescription ID: {record.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-xs font-mono text-neutral-600">
                        Uploaded: {new Date(record.uploaded_at).toLocaleString()}
                      </div>
                    </div>
                    <div className={`px-3 py-1 border text-xs font-mono ${badgeClass}`}>
                      {getPrescriptionStatusLabel(record.status).toUpperCase()}
                    </div>
                  </div>

                  <div className="text-xs font-mono text-neutral-700 mb-1">File: {record.file_name}</div>
                  <div className="text-xs font-mono text-neutral-500 mb-2">
                    {record.doctor_name ? `Doctor: ${record.doctor_name}` : 'Doctor name not provided'}
                  </div>

                  {record.status === 'approved' && (
                    <div className="mb-2 text-xs font-mono text-emerald-700">
                      Your prescription was approved and is ready for pharmacist-verified ordering.
                    </div>
                  )}

                  {record.status === 'rejected' && (
                    <div className="mb-2 text-xs font-mono text-red-700">
                      Rejection reason: {record.rejection_reason || 'No reason was recorded.'}
                    </div>
                  )}

                  {record.reviewed_at && (
                    <div className="mb-3 text-xs font-mono text-neutral-600">
                      Reviewed: {new Date(record.reviewed_at).toLocaleString()}
                      {record.reviewer_name ? ` by ${record.reviewer_name}` : ''}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <WireframeButton
                      label={openingFileId === record.id ? 'Opening...' : 'Open File'}
                      variant="secondary"
                      disabled={openingFileId === record.id}
                      onClick={() => void handleOpenFile(record)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </WireframeCard>
      </div>
    </WireframeLayout>
  );
}
