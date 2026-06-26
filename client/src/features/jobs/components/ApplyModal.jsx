import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import CompanyLogo from './CompanyLogo';
import { getInitials } from '../utils';

const MAX_COVER_LETTER = 2000;

export default function ApplyModal({ job, onApply, onClose }) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onApply(coverLetter.trim());
      toast.success('Application submitted');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-sm sm:p-4">
      <div className="card h-full w-full max-w-lg overflow-y-auto p-6 sm:h-auto sm:max-h-[90vh]">
        <h2 className="font-display text-xl font-semibold">Apply to {job.title}</h2>
        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
          <CompanyLogo logo={job.companyLogo} companyName={job.companyName} size="h-6 w-6" textSize="text-[10px]" />
          <span>{job.companyName}</span>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="" className="avatar h-11 w-11" />
          ) : (
            <div className="avatar flex h-11 w-11 items-center justify-center bg-brand-500 text-sm font-bold text-white">
              {getInitials(user?.name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
            {user?.headline && <p className="truncate text-xs text-gray-500">{user.headline}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="coverLetter" className="mb-1 block text-sm font-medium text-gray-700">
            Cover letter <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            maxLength={MAX_COVER_LETTER}
            placeholder="Tell the recruiter why you're a great fit..."
            className="input"
          />
          <p className="mt-1 text-right text-xs text-gray-500">
            {coverLetter.length}/{MAX_COVER_LETTER}
          </p>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
