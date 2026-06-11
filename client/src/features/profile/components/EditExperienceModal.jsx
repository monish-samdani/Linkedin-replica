import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import FormInput from '../../../components/ui/FormInput';
import { useAuth } from '../../../context/AuthContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

const emptyForm = {
  title: '',
  company: '',
  location: '',
  startMonth: 'Jan',
  startYear: String(new Date().getFullYear()),
  endMonth: 'Jan',
  endYear: String(new Date().getFullYear()),
  isCurrent: false,
  description: '',
};

export default function EditExperienceModal({ experience, onClose }) {
  const { updateUser } = useAuth();
  const isEdit = !!experience;
  const [form, setForm] = useState(() => {
    if (!experience) return emptyForm;
    const [startMonth = 'Jan', startYear = ''] = (experience.startDate || '').split(' ');
    const [endMonth = 'Jan', endYear = ''] = (experience.endDate || '').split(' ');
    return {
      title: experience.title || '',
      company: experience.company || '',
      location: experience.location || '',
      startMonth,
      startYear,
      endMonth,
      endYear,
      isCurrent: experience.isCurrent || false,
      description: experience.description || '',
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      title: form.title,
      company: form.company,
      location: form.location,
      startDate: `${form.startMonth} ${form.startYear}`,
      endDate: form.isCurrent ? '' : `${form.endMonth} ${form.endYear}`,
      isCurrent: form.isCurrent,
      description: form.description,
    };
    try {
      const { data } = isEdit
        ? await api.put(`${ENDPOINTS.AUTH.EXPERIENCE}/${experience._id}`, payload)
        : await api.post(ENDPOINTS.AUTH.EXPERIENCE, payload);
      updateUser(data.data.user);
      toast.success(isEdit ? 'Experience updated' : 'Experience added');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save experience');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <h2 className="font-display text-xl font-semibold">{isEdit ? 'Edit' : 'Add'} experience</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <FormInput label="Job title" name="title" value={form.title} onChange={handleChange} required placeholder="Ex: Software Engineer" />
          <FormInput label="Company" name="company" value={form.company} onChange={handleChange} required placeholder="Ex: Google" />
          <FormInput label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Ex: Bengaluru, India" />
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Start date</label>
              <div className="flex gap-2">
                <select name="startMonth" value={form.startMonth} onChange={handleChange} className="input">
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="startYear" value={form.startYear} onChange={handleChange} className="input">
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            {!form.isCurrent && (
              <div>
                <label className="mb-1 block text-sm font-medium">End date</label>
                <div className="flex gap-2">
                  <select name="endMonth" value={form.endMonth} onChange={handleChange} className="input">
                    {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select name="endYear" value={form.endYear} onChange={handleChange} className="input">
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" name="isCurrent" checked={form.isCurrent} onChange={handleChange} />
            Currently working here
          </label>
          <FormInput as="textarea" label="Description" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe your role and achievements" />
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
