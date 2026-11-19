import Input from '../common/Input';
import Button from '../common/Button';

const StudentProfileForm = ({
  profile,
  onChange,
  onSave,
  onUpload,
  isLoading,
  uploadingFile,
  error,
  success
}) => (
  <form className="stack-form" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
    {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
    {success ? <p className="auth-feedback auth-feedback--success" role="status">{success}</p> : null}
    <div className="form-grid">
      <Input label="Full name" name="name" value={profile.name} onChange={onChange} required maxLength={120} />
      <Input label="Email (read-only)" type="email" value={profile.email} readOnly />
      <Input label="Phone" name="phone" value={profile.phone} onChange={onChange} maxLength={40} />
      <Input label="College" name="college" value={profile.college} onChange={onChange} maxLength={120} />
      <Input label="Degree" name="degree" value={profile.degree} onChange={onChange} maxLength={120} />
      <Input label="Branch" name="branch" value={profile.branch} onChange={onChange} maxLength={120} />
      <Input
        label="Graduation year"
        name="graduationYear"
        type="number"
        value={profile.graduationYear ?? ''}
        onChange={onChange}
        min={1900}
        max={2200}
        step={1}
      />
      <Input
        label="Skills (comma-separated)"
        name="skills"
        value={profile.skills.join(', ')}
        onChange={onChange}
        placeholder="React, Node.js"
      />
      <Input label="GitHub profile" name="github" type="url" value={profile.github} onChange={onChange} />
      <Input label="LinkedIn profile" name="linkedin" type="url" value={profile.linkedin} onChange={onChange} />
      <Input label="Portfolio" name="portfolio" type="url" value={profile.portfolio} onChange={onChange} />
      <Input label="Location" name="location" value={profile.location} onChange={onChange} maxLength={120} />
    </div>
    <div className="profile-upload-grid">
      <div className="field profile-upload-field">
        <label className="field__label" htmlFor="student-resume-upload">Resume (PDF, up to 10 MB)</label>
        <input
          id="student-resume-upload"
          className="field__input"
          type="file"
          accept="application/pdf,.pdf"
          disabled={Boolean(uploadingFile)}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) onUpload('resume', file);
          }}
        />
        {uploadingFile === 'resume' ? <span className="muted" role="status">Uploading resume...</span> : null}
        {profile.resume
          ? <a className="text-link" href={profile.resume} target="_blank" rel="noopener noreferrer">View current resume</a>
          : <span className="muted">No resume uploaded</span>}
      </div>
      <div className="field profile-upload-field">
        <label className="field__label" htmlFor="student-profile-image-upload">
          Profile image (JPEG, PNG, or WebP, up to 5 MB)
        </label>
        <input
          id="student-profile-image-upload"
          className="field__input"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          disabled={Boolean(uploadingFile)}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) onUpload('image', file);
          }}
        />
        {uploadingFile === 'image' ? <span className="muted" role="status">Uploading profile image...</span> : null}
        {profile.profileImage
          ? <img className="profile-upload-preview" src={profile.profileImage} alt="Current profile" />
          : <span className="muted">No profile image uploaded</span>}
      </div>
    </div>
    <label className="field">
      <span className="field__label">Bio</span>
      <textarea className="field__input" name="bio" rows="4" value={profile.bio} onChange={onChange} maxLength={2000} />
    </label>
    <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
      {isLoading ? 'Saving profile...' : 'Save profile'}
    </Button>
  </form>
);

export default StudentProfileForm;
