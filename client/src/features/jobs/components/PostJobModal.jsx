import { useState } from 'react';
import toast from 'react-hot-toast';
import * as jobsApi from '../../../api/jobs';
import JobForm from './JobForm';

export default function PostJobModal({ onClose, onCreated }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const job = await jobsApi.createJob(payload);
      toast.success('Job posted');
      onCreated?.(job);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 backdrop-blur-sm sm:p-4">
      <div className="card h-full w-full max-w-2xl overflow-y-auto p-6 sm:h-auto sm:max-h-[90vh]">
        <h2 className="font-display text-xl font-semibold">Post a job</h2>
        <JobForm onSubmit={handleSubmit} onCancel={onClose} submitting={submitting} submitLabel="Post job" />
      </div>
    </div>
  );
}
