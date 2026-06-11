import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import FormInput from '../../../components/ui/FormInput';
import { useAuth } from '../../../context/AuthContext';

const DEGREES = ["Bachelor's", "Master's", 'PhD', 'Other'];
const YEARS = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

const emptyForm = {
  school: '',
  degree: "Bachelor's",
  field: '',
  startYear: String(new Date().getFullYear() - 4),
  endYear: String(new Date().getFullYear()),
  description: '',
};

export default function EditEducationModal({ education, onClose }) {
  const { updateUser } = useAuth();
  const isEdit = !!education;
  const [form, setForm] = useState(() => {
    if (!education) return emptyForm;
    return {
      school: education.school || '',
      degree: education.degree || "Bachelor's",
      field: education.field || '',
      startYear: education.startYear || '',
      endYear: education.endYear || '',
      description: education.description || '',
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = isEdit
        ? await api.put(`${ENDPOINTS.AUTH.EDUCATION}/${education._id}`, form)
        : await api.post(ENDPOINTS.AUTH.EDUCATION, form);
      updateUser(data.data.user);
      toast.success(isEdit ? 'Education updated' : 'Education added');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save education');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <h2 className="font-display text-xl font-semibold">{isEdit ? 'Edit' : 'Add'} education</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <FormInput label="School" name="school" value={form.school} onChange={handleChange} required />
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Degree</label>
            <select name="degree" value={form.degree} onChange={handleChange} className="input">
              {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <FormInput label="Field of study" name="field" value={form.field} onChange={handleChange} />
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Start year</label>
              <select name="startYear" value={form.startYear} onChange={handleChange} className="input">
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">End year</label>
              <select name="endYear" value={form.endYear} onChange={handleChange} className="input">
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <FormInput as="textarea" label="Description" name="description" value={form.description} onChange={handleChange} rows={3} />
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
