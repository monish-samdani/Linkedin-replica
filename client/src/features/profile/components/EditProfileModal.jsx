import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../context/AuthContext';
import FormInput from '../../../components/ui/FormInput';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

export default function EditProfileModal({ user, onClose }) {
  const { updateProfile, isLoading } = useUpdateProfile();
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user.name || '',
    headline: user.headline || '',
    currentPosition: user.currentPosition || '',
    bio: user.bio || '',
    about: user.about || '',
    location: user.location || '',
    profilePhoto: user.profilePhoto || '',
    website: user.website || '',
    phone: user.phone || '',
  });
  const [nameError, setNameError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'name' && value.trim()) setNameError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError('Name cannot be empty');
      return;
    }
    await updateProfile(form);
    onClose();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(ENDPOINTS.AUTH.DELETE_ACCOUNT);
      toast.success('Account deleted successfully');
      updateUser(null);
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <h2 className="font-display text-xl font-semibold">Edit profile</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <FormInput
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={nameError}
            required
          />
          <FormInput
            label="Headline"
            name="headline"
            value={form.headline}
            onChange={handleChange}
            maxLength={220}
            placeholder="Ex: Software Engineer at Acme Inc."
          />
          <p className="-mt-2 mb-4 text-right text-xs text-gray-500">{form.headline.length}/220</p>
          <FormInput
            label="Current position"
            name="currentPosition"
            value={form.currentPosition}
            onChange={handleChange}
            placeholder="Ex: Senior Developer at Acme Inc."
          />
          <FormInput label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Ex: Mumbai, India" />
          <FormInput
            as="textarea"
            label="Bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            placeholder="A short bio about yourself..."
          />
          <p className="-mt-2 mb-4 text-right text-xs text-gray-500">{form.bio.length}/500</p>
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
          <FormInput
            label="Profile photo URL"
            name="profilePhoto"
            value={form.profilePhoto}
            onChange={handleChange}
            placeholder="https://"
          />
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

        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-red-600">Danger zone</h3>
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="mt-2 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete Account
            </button>
          ) : (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">Are you sure? This cannot be undone.</p>
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={isDeleting}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
