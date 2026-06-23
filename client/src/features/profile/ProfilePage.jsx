import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { ENDPOINTS } from '../../api/endpoints';
import * as connectionsApi from '../../api/connections';
import MainLayout from '../../components/layout/MainLayout';
import InProgressCard from '../../components/shared/InProgressCard';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from './hooks/useProfile';
import ConnectButton from '../connections/components/ConnectButton';
import EditProfileModal from './components/EditProfileModal';
import EditExperienceModal from './components/EditExperienceModal';
import EditEducationModal from './components/EditEducationModal';

function Avatar({ user, size = 'lg' }) {
  const sizes = { lg: 'h-24 w-24 text-2xl', sm: 'h-10 w-10 text-sm' };
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  if (user?.profilePhoto) {
    return <img src={user.profilePhoto} alt="" className={`avatar ${sizes[size]} border-4 border-white`} />;
  }
  return (
    <div className={`avatar flex ${sizes[size]} items-center justify-center border-4 border-white bg-brand-500 font-bold text-white`}>
      {initials}
    </div>
  );
}

function CollapsibleText({ text, lines = 3 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const shouldCollapse = text.length > 150;
  return (
    <div>
      <p className={`text-sm text-gray-700 whitespace-pre-wrap ${!expanded && shouldCollapse ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
      {shouldCollapse && (
        <button onClick={() => setExpanded((e) => !e)} className="mt-1 text-sm font-semibold text-gray-500 hover:text-brand-500">
          {expanded ? 'Show less' : '...see more'}
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: authUser, updateUser } = useAuth();
  const isOwnProfile = userId === 'me';
  const { profile, isLoading } = useProfile(isOwnProfile ? null : userId);
  const user = isOwnProfile ? authUser : profile;

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditAbout, setShowEditAbout] = useState(false);
  const [expModal, setExpModal] = useState(null);
  const [eduModal, setEduModal] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [skillsModal, setSkillsModal] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [connState, setConnState] = useState({ status: 'none', connectionId: null });
  const [mutual, setMutual] = useState([]);

  const loadConnInfo = useCallback(async () => {
    if (isOwnProfile || !userId || userId === 'me') return;
    try {
      const [state, mutualRes] = await Promise.all([
        connectionsApi.getStatus(userId),
        connectionsApi.getMutual(userId),
      ]);
      setConnState(state);
      setMutual(mutualRes.mutual || []);
    } catch {
      // Non-critical: leave defaults if status/mutual can't be loaded.
    }
  }, [isOwnProfile, userId]);

  useEffect(() => {
    loadConnInfo();
  }, [loadConnInfo]);

  const handleDeleteExperience = async (id) => {
    if (!confirm('Delete this experience?')) return;
    try {
      const { data } = await api.delete(`${ENDPOINTS.AUTH.EXPERIENCE}/${id}`);
      updateUser(data.data.user);
      toast.success('Experience deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!confirm('Delete this education?')) return;
    try {
      const { data } = await api.delete(`${ENDPOINTS.AUTH.EDUCATION}/${id}`);
      updateUser(data.data.user);
      toast.success('Education deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const saveSkills = async (skills) => {
    try {
      const { data } = await api.put(ENDPOINTS.AUTH.SKILLS, { skills });
      updateUser(data.data.user);
      toast.success('Skills updated');
      setSkillsModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update skills');
    }
  };

  if (!isOwnProfile && isLoading) {
    return (
      <MainLayout>
        <div className="py-6">
          <div className="skeleton h-32 w-full rounded-lg" />
          <div className="mt-4 flex gap-4">
            <div className="skeleton h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-6 w-48" />
              <div className="skeleton h-4 w-64" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) return null;

  const skills = user.skills || [];
  const visibleSkills = showAllSkills ? skills : skills.slice(0, 5);

  return (
    <MainLayout>
      <div className="grid gap-4 py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Profile Card */}
          <div className="card overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-brand-500 to-brand-600">
              {user.bannerPhoto && <img src={user.bannerPhoto} alt="" className="h-full w-full object-cover" />}
              {isOwnProfile && (
                <button className="absolute right-3 top-3 rounded-full bg-white p-2 text-sm shadow hover:bg-gray-50" title="Edit banner">
                  ✏️
                </button>
              )}
            </div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 flex items-end justify-between">
                <Avatar user={user} />
                {isOwnProfile && (
                  <button className="rounded-full bg-white p-2 text-sm shadow hover:bg-gray-50" title="Edit photo">
                    ✏️
                  </button>
                )}
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold">{user.name}</h1>
              {user.headline && <p className="mt-1 text-gray-600">{user.headline}</p>}
              {user.currentPosition && <p className="mt-1 text-sm text-gray-700">💼 {user.currentPosition}</p>}
              {user.bio && <p className="mt-2 text-sm text-gray-600">{user.bio}</p>}
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                {user.location && <span>📍 {user.location}</span>}
                {user.website && (
                  <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline">
                    🔗 {user.website}
                  </a>
                )}
              </div>
              <p className="mt-2 text-sm text-brand-500">{user.connections?.length || 0} connections</p>
              {!isOwnProfile && mutual.length > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {mutual.length} mutual connection{mutual.length > 1 ? 's' : ''}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                {isOwnProfile ? (
                  <>
                    <button onClick={() => setShowEditProfile(true)} className="btn-secondary text-sm">Edit profile</button>
                    <button className="btn-ghost text-sm">Add section ▾</button>
                  </>
                ) : (
                  <>
                    <ConnectButton
                      key={`${connState.status}:${connState.connectionId}`}
                      userId={userId}
                      initialStatus={connState.status}
                      connectionId={connState.connectionId}
                      onChange={loadConnInfo}
                    />
                    <button className="btn-secondary text-sm">Message</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">About</h2>
              {isOwnProfile && (
                <button onClick={() => setShowEditAbout(true)} className="text-gray-500 hover:text-brand-500">✏️</button>
              )}
            </div>
            {user.about ? (
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{user.about}</p>
            ) : isOwnProfile ? (
              <button onClick={() => setShowEditAbout(true)} className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500">
                <span className="text-lg">+</span> Add a summary about yourself
              </button>
            ) : (
              <p className="mt-3 text-sm text-gray-500">No about section</p>
            )}
          </div>

          {/* Experience */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Experience</h2>
              {isOwnProfile && (
                <button onClick={() => setExpModal({})} className="text-xl text-gray-500 hover:text-brand-500">+</button>
              )}
            </div>
            {user.experience?.length > 0 ? (
              <div className="mt-4 space-y-6">
                {user.experience.map((exp) => (
                  <div key={exp._id} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                      {exp.company?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{exp.title}</p>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-xs text-gray-500">
                            {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                          </p>
                          {exp.location && <p className="text-xs text-gray-500">{exp.location}</p>}
                        </div>
                        {isOwnProfile && (
                          <div className="flex gap-2">
                            <button onClick={() => setExpModal(exp)} className="text-sm text-gray-500 hover:text-brand-500">✏️</button>
                            <button onClick={() => handleDeleteExperience(exp._id)} className="text-sm text-gray-500 hover:text-red-500">🗑️</button>
                          </div>
                        )}
                      </div>
                      <CollapsibleText text={exp.description} />
                    </div>
                  </div>
                ))}
              </div>
            ) : isOwnProfile ? (
              <button onClick={() => setExpModal({})} className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500">
                <span className="text-lg">+</span> Add your work experience
              </button>
            ) : (
              <p className="mt-3 text-sm text-gray-500">No experience listed</p>
            )}
          </div>

          {/* Education */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Education</h2>
              {isOwnProfile && (
                <button onClick={() => setEduModal({})} className="text-xl text-gray-500 hover:text-brand-500">+</button>
              )}
            </div>
            {user.education?.length > 0 ? (
              <div className="mt-4 space-y-6">
                {user.education.map((edu) => (
                  <div key={edu._id} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                      {edu.school?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{edu.school}</p>
                          <p className="text-sm text-gray-600">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                          <p className="text-xs text-gray-500">{edu.startYear} – {edu.endYear}</p>
                        </div>
                        {isOwnProfile && (
                          <div className="flex gap-2">
                            <button onClick={() => setEduModal(edu)} className="text-sm text-gray-500 hover:text-brand-500">✏️</button>
                            <button onClick={() => handleDeleteEducation(edu._id)} className="text-sm text-gray-500 hover:text-red-500">🗑️</button>
                          </div>
                        )}
                      </div>
                      <CollapsibleText text={edu.description} />
                    </div>
                  </div>
                ))}
              </div>
            ) : isOwnProfile ? (
              <button onClick={() => setEduModal({})} className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500">
                <span className="text-lg">+</span> Add education
              </button>
            ) : (
              <p className="mt-3 text-sm text-gray-500">No education listed</p>
            )}
          </div>

          {/* Skills */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Skills</h2>
              {isOwnProfile && (
                <button onClick={() => setSkillsModal(true)} className="text-xl text-gray-500 hover:text-brand-500">+</button>
              )}
            </div>
            {skills.length > 0 ? (
              <ul className="mt-4 divide-y divide-gray-100">
                {visibleSkills.map((skill) => (
                  <li key={skill.name} className="flex items-center justify-between py-3">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-gray-500">{skill.endorsements || 0} endorsements</span>
                  </li>
                ))}
              </ul>
            ) : isOwnProfile ? (
              <button onClick={() => setSkillsModal(true)} className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-brand-500">
                <span className="text-lg">+</span> Add skills
              </button>
            ) : (
              <p className="mt-3 text-sm text-gray-500">No skills listed</p>
            )}
            {skills.length > 5 && (
              <button onClick={() => setShowAllSkills((s) => !s)} className="mt-2 text-sm font-semibold text-gray-500 hover:text-brand-500">
                {showAllSkills ? 'Show less' : `Show all ${skills.length} skills`}
              </button>
            )}
          </div>
        </div>

        <aside className="hidden space-y-4 lg:block">
          <InProgressCard title="Profile analytics coming soon" subtitle="See who's viewed your profile" />
          <InProgressCard title="People also viewed" subtitle="Discover similar professionals" />
        </aside>
      </div>

      {showEditProfile && <EditProfileModal user={user} onClose={() => setShowEditProfile(false)} />}
      {showEditAbout && <EditProfileModal user={user} onClose={() => setShowEditAbout(false)} />}
      {expModal && (
        <EditExperienceModal
          experience={expModal._id ? expModal : null}
          onClose={() => setExpModal(null)}
        />
      )}
      {eduModal && (
        <EditEducationModal
          education={eduModal._id ? eduModal : null}
          onClose={() => setEduModal(null)}
        />
      )}
      {skillsModal && (
        <SkillsEditModal
          skills={skills}
          skillInput={skillInput}
          setSkillInput={setSkillInput}
          onSave={saveSkills}
          onClose={() => setSkillsModal(false)}
        />
      )}
    </MainLayout>
  );
}

function SkillsEditModal({ skills: initialSkills, skillInput, setSkillInput, onSave, onClose }) {
  const [skills, setSkills] = useState(initialSkills);

  const addSkill = (name) => {
    const trimmed = name.trim();
    if (!trimmed || skills.length >= 10) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    setSkills((p) => [...p, { name: trimmed, endorsements: 0 }]);
    setSkillInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <h2 className="font-display text-xl font-semibold">Edit skills</h2>
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
          placeholder="Add skill and press Enter"
          className="input mt-4"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill.name} className="flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs text-white">
              {skill.name}
              <button type="button" onClick={() => setSkills((p) => p.filter((s) => s.name !== skill.name))}>×</button>
            </span>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => onSave(skills)} className="btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}
