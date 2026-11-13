import { useAuth } from '../../context/AuthContext';
import { studentProfiles } from '../../data/mockData';
import StudentProfileForm from '../../components/forms/StudentProfileForm';

const StudentProfile = () => {
  const { user } = useAuth();
  const profile = studentProfiles[0];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Profile</span>
          <h1>{user?.name || profile.name}</h1>
        </div>
      </div>
      <div className="profile-layout">
        <div className="profile-card">
          <div className="avatar avatar--large">{profile.name[0]}</div>
          <h3>{profile.name}</h3>
          <p>{profile.college}</p>
          <ul className="detail-list compact-list">
            <li>Email: {profile.email}</li>
            <li>Phone: {profile.phone}</li>
            <li>Degree: {profile.degree}</li>
            <li>Skills: {profile.skills.join(', ')}</li>
          </ul>
        </div>
        <div className="panel-card">
          <StudentProfileForm profile={profile} onSave={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
