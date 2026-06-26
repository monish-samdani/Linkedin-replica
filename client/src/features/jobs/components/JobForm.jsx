import { useState } from 'react';
import FormInput from '../../../components/ui/FormInput';
import { CURRENCIES, JOB_TYPES, SALARY_PERIODS, WORKPLACES } from '../utils';

const REQUIRED_FIELDS = ['title', 'companyName', 'location', 'jobType', 'workplace', 'description'];

const toFormState = (job = {}) => ({
  title: job.title || '',
  companyName: job.companyName || '',
  companyLogo: job.companyLogo || '',
  location: job.location || '',
  jobType: job.jobType || '',
  workplace: job.workplace || '',
  description: job.description || '',
  requirements: job.requirements || '',
  salaryMin: job.salaryRange?.min ?? '',
  salaryMax: job.salaryRange?.max ?? '',
  currency: job.salaryRange?.currency || 'USD',
  period: job.salaryRange?.period || 'yearly',
  deadline: job.deadline ? String(job.deadline).slice(0, 10) : '',
});

const buildPayload = (form) => ({
  title: form.title.trim(),
  companyName: form.companyName.trim(),
  companyLogo: form.companyLogo.trim(),
  location: form.location.trim(),
  jobType: form.jobType,
  workplace: form.workplace,
  description: form.description.trim(),
  requirements: form.requirements.trim(),
  salaryRange: {
    min: form.salaryMin === '' ? undefined : Number(form.salaryMin),
    max: form.salaryMax === '' ? undefined : Number(form.salaryMax),
    currency: form.currency,
    period: form.period,
  },
  deadline: form.deadline || undefined,
});

function Select({ label, name, value, onChange, error, options, placeholder, required }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function JobForm({ job, onSubmit, onCancel, submitting, submitLabel = 'Save' }) {
  const [form, setForm] = useState(() => toFormState(job));
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!String(form[field]).trim()) nextErrors[field] = 'This field is required';
    });
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      nextErrors.salaryMax = 'Max must be greater than min';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    await onSubmit(buildPayload(form));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <FormInput label="Job title" name="title" value={form.title} onChange={handleChange} error={errors.title} maxLength={100} required placeholder="Ex: Senior Frontend Engineer" />
      <FormInput label="Company name" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} maxLength={100} required placeholder="Ex: Acme Inc." />
      <FormInput label="Company logo URL" name="companyLogo" value={form.companyLogo} onChange={handleChange} placeholder="https://" />
      <FormInput label="Location" name="location" value={form.location} onChange={handleChange} error={errors.location} required placeholder="Ex: Bengaluru, India" />

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Select label="Job type" name="jobType" value={form.jobType} onChange={handleChange} error={errors.jobType} options={JOB_TYPES} placeholder="Select type" required />
        <Select label="Workplace" name="workplace" value={form.workplace} onChange={handleChange} error={errors.workplace} options={WORKPLACES} placeholder="Select workplace" required />
      </div>

      <FormInput as="textarea" label="Description" name="description" value={form.description} onChange={handleChange} error={errors.description} rows={5} maxLength={5000} required placeholder="Describe the role, responsibilities, and team..." />
      <FormInput as="textarea" label="Requirements" name="requirements" value={form.requirements} onChange={handleChange} rows={4} maxLength={3000} placeholder="List qualifications and skills (optional)..." />

      <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-4">
        <FormInput label="Salary min" name="salaryMin" type="number" value={form.salaryMin} onChange={handleChange} placeholder="60000" />
        <FormInput label="Salary max" name="salaryMax" type="number" value={form.salaryMax} onChange={handleChange} error={errors.salaryMax} placeholder="80000" />
        <Select label="Currency" name="currency" value={form.currency} onChange={handleChange} options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
        <Select label="Period" name="period" value={form.period} onChange={handleChange} options={SALARY_PERIODS} />
      </div>

      <FormInput label="Application deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} />

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
