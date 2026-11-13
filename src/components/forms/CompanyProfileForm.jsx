import Input from '../common/Input';
import Button from '../common/Button';

const CompanyProfileForm = ({ profile, onChange, onSave, isLoading, error, success }) => (
  <form className="stack-form" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
    {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
    {success ? <p className="auth-feedback auth-feedback--success" role="status">{success}</p> : null}
    <div className="form-grid">
      <Input label="Company name" name="companyName" value={profile.companyName} onChange={onChange} required />
      <Input label="Website" name="website" type="url" value={profile.website} onChange={onChange} placeholder="https://example.com" />
      <Input label="Location" name="location" value={profile.location} onChange={onChange} />
      <Input label="Industry" name="industry" value={profile.industry} onChange={onChange} />
      <Input label="Contact email" name="contactEmail" type="email" value={profile.contactEmail} onChange={onChange} />
    </div>
    <label className="field">
      <span className="field__label">Company description</span>
      <textarea className="field__input" name="description" rows="4" value={profile.description} onChange={onChange} />
    </label>
    <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
      {isLoading ? 'Saving profile...' : 'Save company profile'}
    </Button>
  </form>
);

export default CompanyProfileForm;
