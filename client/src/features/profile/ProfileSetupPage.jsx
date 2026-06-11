import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { ENDPOINTS } from '../../api/endpoints';
import FormInput from '../../components/ui/FormInput';
import { useAuth } from '../../context/AuthContext';
import EditExperienceModal from './components/EditExperienceModal';

const STEPS = ['Photo', 'Basic Info', 'Experience', 'Skills'];
const SUGGESTED_SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'MongoDB', 'TypeScript',
  'Communication', 'Leadership', 'Problem Solving', 'Team Management',
  'Project Management', 'Data Analysis', 'UI/UX Design', 'Git',
];

export default function ProfileSetupPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    name: user?.name || '',
    headline: '',
    location: '',
    about: '',
    website: '',
    phone: '',
  });
  const [showExpModal, setShowExpModal] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoSelect = (file) => {
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handlePhotoSelect(file);
  }, []);

  const uploadPhoto = async () => {
    if (!photoFile) {
      setStep(1);
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', photoFile);
    try {
      const { data } = await api.post(ENDPOINTS.AUTH.PROFILE_PHOTO, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.data.user);
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const saveBasicInfo = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.put(ENDPOINTS.AUTH.UPDATE_PROFILE, basicInfo);
      updateUser(data.data.user);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = (name) => {
    const trimmed = name.trim();
    if (!trimmed || skills.length >= 10) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    setSkills((prev) => [...prev, { name: trimmed, endorsements: 0 }]);
    setSkillInput('');
  };

  const finishSetup = async () => {
    setIsSaving(true);
    try {
      if (skills.length > 0) {
        const { data } = await api.put(ENDPOINTS.AUTH.SKILLS, { skills });
        updateUser(data.data.user);
      }
      navigate('/in/me');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save skills');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-surface-1 px-4 py-10">
      <div className="card mx-auto max-w-2xl p-6 md:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  i <= step ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`mx-1 h-0.5 flex-1 ${i < step ? 'bg-brand-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-gray-500">Step {step + 1} of 4 — {STEPS[step]}</p>
        </div>

        {step === 0 && (
          <div className="text-center">
            <h2 className="font-display text-xl">Add a profile photo</h2>
            <p className="mt-2 text-sm text-gray-600">Help people recognize you</p>
            <div
              className="relative mx-auto mt-6 flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50"
              onClick={() => document.getElementById('photo-input').click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="avatar h-full w-full" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-500 text-3xl font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow">
                📷
              </div>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoSelect(e.target.files[0])}
              />
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={uploadPhoto} className="btn-primary" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </button>
              <button onClick={() => setStep(1)} className="btn-ghost">Skip for now</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-xl">Basic information</h2>
            <div className="mt-4">
              <FormInput label="Full name" name="name" value={basicInfo.name} onChange={(e) => setBasicInfo((p) => ({ ...p, name: e.target.value }))} required />
              <FormInput label="Professional headline" name="headline" value={basicInfo.headline} onChange={(e) => setBasicInfo((p) => ({ ...p, headline: e.target.value }))} maxLength={220} placeholder="Ex: Software Engineer at Acme Inc." />
              <p className="-mt-2 mb-4 text-right text-xs text-gray-500">{basicInfo.headline.length}/220</p>
              <FormInput label="Location" name="location" value={basicInfo.location} onChange={(e) => setBasicInfo((p) => ({ ...p, location: e.target.value }))} placeholder="Ex: Mumbai, India" />
              <FormInput as="textarea" label="About" name="about" value={basicInfo.about} onChange={(e) => setBasicInfo((p) => ({ ...p, about: e.target.value }))} rows={4} maxLength={2600} placeholder="Write a summary about your professional background..." />
              <p className="-mt-2 mb-4 text-right text-xs text-gray-500">{basicInfo.about.length}/2600</p>
              <FormInput label="Website" name="website" value={basicInfo.website} onChange={(e) => setBasicInfo((p) => ({ ...p, website: e.target.value }))} />
              <FormInput label="Phone" name="phone" value={basicInfo.phone} onChange={(e) => setBasicInfo((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(0)} className="btn-ghost">Back</button>
              <button onClick={saveBasicInfo} className="btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl">Add your most recent position</h2>
            <button onClick={() => setShowExpModal(true)} className="btn-secondary mt-4">
              + Add experience
            </button>
            {user?.experience?.length > 0 && (
              <div className="mt-4 space-y-3">
                {user.experience.map((exp) => (
                  <div key={exp._id} className="rounded border border-gray-200 p-3 text-sm">
                    <p className="font-semibold">{exp.title}</p>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-500">{exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary">Continue</button>
            </div>
            {showExpModal && (
              <EditExperienceModal onClose={() => setShowExpModal(false)} />
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-xl">What skills do you have?</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs hover:border-brand-500 hover:text-brand-500"
                >
                  {skill}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
              placeholder="Add a custom skill and press Enter"
              className="input mt-4"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill.name} className="flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs text-white">
                  {skill.name}
                  <button type="button" onClick={() => setSkills((p) => p.filter((s) => s.name !== skill.name))} className="ml-1 hover:opacity-80">×</button>
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">{skills.length}/10 skills</p>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-ghost">Back</button>
              <button onClick={finishSetup} className="btn-primary" disabled={isSaving}>
                {isSaving ? 'Finishing...' : 'Finish & View Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
