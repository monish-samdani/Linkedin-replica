import { useState } from 'react';
import FormInput from '../../../components/ui/FormInput';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

export default function EditProfileModal({ user, onClose }) {
  const { updateProfile, isLoading } = useUpdateProfile();
  const [form, setForm] = useState({
    name: user.name || '',
    headline: user.headline || '',
    about: user.about || '',
    location: user.location || '',
    website: user.website || '',
    phone: user.phone || '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <h2 className="font-display text-xl font-semibold">Edit profile</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <FormInput label="Full name" name="name" value={form.name} onChange={handleChange} required />
          <FormInput
            label="Headline"
            name="headline"
            value={form.headline}
            onChange={handleChange}
            maxLength={220}
            placeholder="Ex: Software Engineer at Acme Inc."
          />
          <p className="-mt-2 mb-4 text-right text-xs text-gray-500">{form.headline.length}/220</p>
          <FormInput label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Ex: Mumbai, India" />
          <FormInput
            as="textarea"
            label="About"
            name="about"
            value={form.about}
            onChange={handleChange}
            rows={4}
            maxLength={2600}
            placeholder="Write a summary about your professional background..."
          />
          <p className="-mt-2 mb-4 text-right text-xs text-gray-500">{form.about.length}/2600</p>
          <FormInput label="Website" name="website" value={form.website} onChange={handleChange} placeholder="https://" />
          <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
