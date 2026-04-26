import { supabase } from './supabase';

export const PRESCRIPTIONS_BUCKET = 'prescriptions';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export type PrescriptionStatus = 'pending' | 'approved' | 'rejected';
export type PrescriptionStatusFilter = PrescriptionStatus | 'all';
export type UserRole = 'customer' | 'pharmacist' | 'inventory_manager' | 'admin';

type UserProfile = {
  id: string;
  role: UserRole;
  status: string;
  full_name: string | null;
  email: string | null;
};

type PrescriptionRow = {
  id: string;
  customer_id: string;
  file_name: string;
  file_url: string | null;
  doctor_name: string | null;
  status: PrescriptionStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  uploaded_at: string;
};

export type PrescriptionRecord = PrescriptionRow & {
  customer_name: string;
  customer_email: string;
  reviewer_name: string | null;
};

function requireAuthenticatedUserId(userId: string | undefined) {
  if (!userId) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  return userId;
}

export function getPrescriptionStatusLabel(status: PrescriptionStatus) {
  if (status === 'pending') return 'Pending Review';
  if (status === 'approved') return 'Approved';
  return 'Rejected';
}

export function validatePrescriptionFile(file: File | null) {
  if (!file) {
    throw new Error('Please choose a prescription file before uploading.');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Only PDF, JPG, and PNG files are allowed for prescriptions.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Prescription file must be 10 MB or smaller.');
  }
}

export async function getCurrentUserProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = requireAuthenticatedUserId(user?.id);

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, role, status, full_name, email')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message || 'User profile not found.');
  }

  return profile as UserProfile;
}

async function attachUserDetails(rows: PrescriptionRow[]) {
  const ids = Array.from(
    new Set(
      rows.flatMap((row) => [row.customer_id, row.reviewed_by].filter(Boolean) as string[]),
    ),
  );

  if (ids.length === 0) {
    return rows.map((row) => ({
      ...row,
      customer_name: 'Unknown Customer',
      customer_email: '',
      reviewer_name: null,
    }));
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', ids);

  if (error) {
    throw new Error(error.message);
  }

  const userMap = new Map(
    (users ?? []).map((user) => [
      user.id as string,
      {
        full_name: (user.full_name as string | null) ?? null,
        email: (user.email as string | null) ?? null,
      },
    ]),
  );

  return rows.map((row) => ({
    ...row,
    customer_name: userMap.get(row.customer_id)?.full_name || 'Unknown Customer',
    customer_email: userMap.get(row.customer_id)?.email || '',
    reviewer_name: row.reviewed_by ? userMap.get(row.reviewed_by)?.full_name || 'Unknown Reviewer' : null,
  }));
}

export async function loadCurrentCustomerPrescriptions() {
  const profile = await getCurrentUserProfile();

  if (profile.role !== 'customer') {
    throw new Error('Only customers can access uploaded prescriptions.');
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .select(
      'id, customer_id, file_name, file_url, doctor_name, status, rejection_reason, reviewed_by, reviewed_at, uploaded_at',
    )
    .eq('customer_id', profile.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return attachUserDetails((data ?? []) as PrescriptionRow[]);
}

export async function loadPrescriptionsForReview(statusFilter: PrescriptionStatusFilter = 'pending') {
  const profile = await getCurrentUserProfile();

  if (profile.role !== 'pharmacist') {
    throw new Error('Only pharmacists can review prescriptions.');
  }

  let query = supabase
    .from('prescriptions')
    .select(
      'id, customer_id, file_name, file_url, doctor_name, status, rejection_reason, reviewed_by, reviewed_at, uploaded_at',
    )
    .order('uploaded_at', { ascending: true });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return attachUserDetails((data ?? []) as PrescriptionRow[]);
}

export async function uploadPrescription(file: File) {
  validatePrescriptionFile(file);

  const profile = await getCurrentUserProfile();

  if (profile.role !== 'customer') {
    throw new Error('Only customers can upload prescriptions.');
  }

  const userId = profile.id;
  const uniqueFileName = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;
  const filePath = `${userId}/${uniqueFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(PRESCRIPTIONS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      customer_id: userId,
      file_name: file.name,
      file_url: filePath,
      status: 'pending',
    })
    .select(
      'id, customer_id, file_name, file_url, doctor_name, status, rejection_reason, reviewed_by, reviewed_at, uploaded_at',
    )
    .single();

  if (error || !data) {
    await supabase.storage.from(PRESCRIPTIONS_BUCKET).remove([filePath]);
    throw new Error(error?.message || 'Prescription metadata could not be saved.');
  }

  const [record] = await attachUserDetails([data as PrescriptionRow]);
  return record;
}

export async function createPrescriptionSignedUrl(fileUrl: string | null) {
  if (!fileUrl) {
    throw new Error('This prescription does not have a file URL.');
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const { data, error } = await supabase.storage
    .from(PRESCRIPTIONS_BUCKET)
    .createSignedUrl(fileUrl, 60 * 30);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Could not create a secure file link.');
  }

  return data.signedUrl;
}

export async function reviewPrescription({
  prescriptionId,
  status,
  rejectionReason,
}: {
  prescriptionId: string;
  status: Exclude<PrescriptionStatus, 'pending'>;
  rejectionReason?: string;
}) {
  const profile = await getCurrentUserProfile();

  if (profile.role !== 'pharmacist') {
    throw new Error('Only pharmacists can review prescriptions.');
  }

  const trimmedReason = rejectionReason?.trim() ?? '';

  if (status === 'rejected' && !trimmedReason) {
    throw new Error('Please provide a rejection reason before rejecting a prescription.');
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .update({
      status,
      rejection_reason: status === 'rejected' ? trimmedReason : null,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', prescriptionId)
    .select(
      'id, customer_id, file_name, file_url, doctor_name, status, rejection_reason, reviewed_by, reviewed_at, uploaded_at',
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Prescription review could not be saved.');
  }

  const [record] = await attachUserDetails([data as PrescriptionRow]);
  return record;
}
