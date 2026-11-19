import { useEffect, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import StudentProfileForm from '../../components/forms/StudentProfileForm';
import Loader from '../../components/common/Loader';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentProfileFile
} from '../../services/studentProfileService';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    getStudentProfile()
      .then((response) => {
        if (active) setProfile(response.data.profile);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load your student profile.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({
      ...current,
      [name]: name === 'skills'
        ? value.split(',').map((skill) => skill.trim()).filter(Boolean)
        : value
    }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const payload = {
        name: profile.name,
        phone: profile.phone,
        college: profile.college,
        degree: profile.degree,
        branch: profile.branch,
        graduationYear: profile.graduationYear === '' || profile.graduationYear === null
          ? null
          : Number(profile.graduationYear),
        skills: profile.skills,
        github: profile.github,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        bio: profile.bio,
        location: profile.location
      };
      const response = await updateStudentProfile(payload);
      setProfile(response.data.profile);
      updateUser({ name: response.data.profile.name, phone: response.data.profile.phone });
      setSuccess(response.message || 'Student profile updated successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save your student profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (kind, file) => {
    setError('');
    setSuccess('');
    setUploadingFile(kind);
    try {
      const response = await uploadStudentProfileFile(kind, file);
      setProfile(response.data.profile);
      setSuccess(response.message || `${kind === 'resume' ? 'Resume' : 'Profile image'} uploaded successfully.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to upload this file.');
    } finally {
      setUploadingFile('');
    }
  };

  if (isLoading) return <Loader text="Loading student profile..." />;
  if (!profile) {
    return <p className="auth-feedback auth-feedback--error" role="alert">{error || 'Unable to load your student profile.'}</p>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Profile</span>
          <h1>{profile.name || user?.name}</h1>
        </div>
      </div>
      <div className="profile-layout">
        <div className="profile-card">
          {profile.profileImage
            ? <img className="avatar avatar--large profile-avatar-image" src={profile.profileImage} alt={`${profile.name || 'Student'} profile`} />
            : <div className="avatar avatar--large">{(profile.name || user?.name || 'S')[0]}</div>}
          <h3>{profile.name}</h3>
          <p>{profile.college || 'Add your college'}</p>
          <ul className="detail-list compact-list">
            <li>Email: {profile.email}</li>
            <li>Phone: {profile.phone || 'Not provided'}</li>
            <li>Degree: {profile.degree || 'Not provided'}</li>
            <li>Skills: {profile.skills.length ? profile.skills.join(', ') : 'Not provided'}</li>
          </ul>
        </div>
        <div className="panel-card">
          <StudentProfileForm
            profile={profile}
            onChange={handleChange}
            onSave={handleSave}
            onUpload={handleUpload}
            isLoading={isSaving}
            uploadingFile={uploadingFile}
            error={error}
            success={success}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
