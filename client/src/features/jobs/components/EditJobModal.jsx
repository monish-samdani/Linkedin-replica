import { useState } from 'react';
import toast from 'react-hot-toast';
import * as jobsApi from '../../../api/jobs';
import JobForm from './JobForm';

export default function EditJobModal({ job, onClose, onUpdated }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const updated = await jobsApi.updateJob(job._id, payload);
      toast.success('Job updated');
      onUpdated?.(updated);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-sm sm:p-4">
      <div className="card h-full w-full max-w-2xl overflow-y-auto p-6 sm:h-auto sm:max-h-[90vh]">
        <h2 className="font-display text-xl font-semibold">Edit job</h2>
        <JobForm job={job} onSubmit={handleSubmit} onCancel={onClose} submitting={submitting} submitLabel="Save changes" />
      </div>
    </div>
  );
}
