import PharmacistSidebar from '../../components/PharmacistSidebar';
import { WireframeLayout, WireframeBox, WireframeButton, WireframeCard } from '../../components/WireframeLayout';

export default function PharmacistProfile() {

  return (
    <WireframeLayout 
      sidebar={<PharmacistSidebar />}
      title="Pharmacist Profile"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <WireframeCard title="Professional Information">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-mono text-neutral-700 mb-1">Full Name</div>
                  <WireframeBox label="Dr. John Pharmacist" />
                </div>
                <div>
                  <div className="text-xs font-mono text-neutral-700 mb-1">Email</div>
                  <WireframeBox label="john.pharmacist@email.com" />
                </div>
                <div>
                  <div className="text-xs font-mono text-neutral-700 mb-1">Phone Number</div>
                  <WireframeBox label="(555) 123-4567" />
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-1">Profile Photo</div>
              <WireframeBox height="h-40" label="[Profile Photo]" className="mb-2" />
              <WireframeButton label="Upload Photo" variant="secondary" className="w-full" />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <WireframeButton label="Save Changes" />
            <WireframeButton label="Cancel" variant="secondary" />
          </div>
        </WireframeCard>

        {/* Account Settings */}
        <WireframeCard title="Account Settings">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-mono text-neutral-700 mb-1">Change Password</div>
              <div className="grid grid-cols-3 gap-4">
                <WireframeBox label="Current Password" />
                <WireframeBox label="New Password" />
                <WireframeBox label="Confirm Password" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <div className="text-xs font-mono text-neutral-700">Enable email notifications</div>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <div className="text-xs font-mono text-neutral-700">Enable SMS alerts for urgent prescriptions</div>
            </div>
            <div className="flex gap-4">
              <WireframeButton label="Update Settings" />
              <WireframeButton label="Cancel" variant="secondary" />
            </div>
          </div>
        </WireframeCard>
      </div>
    </WireframeLayout>
  );
}
