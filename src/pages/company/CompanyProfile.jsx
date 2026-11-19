import { useEffect, useState } from 'react';
import CompanyProfileForm from '../../components/forms/CompanyProfileForm';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/useAuth';
import { getMyCompanyProfile, saveMyCompanyProfile } from '../../services/companyService';

const CompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    getMyCompanyProfile()
      .then((response) => {
        if (!active) return;
        setProfile(response.data.company || {
          companyName: user?.name || '',
          website: '',
          location: '',
          industry: '',
          description: '',
          contactEmail: user?.email || ''
        });
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load your company profile.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const response = await saveMyCompanyProfile(profile);
      setProfile(response.data.company);
      setSuccess(response.message || 'Company profile saved.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save your company profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader text="Loading company profile..." />;
  if (!profile) {
    return <p className="auth-feedback auth-feedback--error" role="alert">{error || 'Unable to load your company profile.'}</p>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">{profile._id ? 'Company profile' : 'Company onboarding'}</span>
          <h1>{profile.companyName || 'Set up your company profile'}</h1>
        </div>
      </div>
      <div className="profile-layout">
        <div className="profile-card">
          <div className="company-card__logo company-card__logo--large">{(profile.companyName || user?.name || 'CC').slice(0, 2).toUpperCase()}</div>
          <h3>{profile.companyName || 'Company name'}</h3>
          <p>{profile.industry || 'Add your company industry'}</p>
          <ul className="detail-list compact-list">
            <li>Website: {profile.website || 'Not provided'}</li>
            <li>Location: {profile.location || 'Not provided'}</li>
            <li>Email: {profile.contactEmail || user?.email}</li>
          </ul>
        </div>
        <div className="panel-card">
          <CompanyProfileForm
            profile={profile}
            onChange={handleChange}
            onSave={handleSave}
            isLoading={isSaving}
            error={error}
            success={success}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
