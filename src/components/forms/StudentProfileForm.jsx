import Input from '../common/Input';
import Button from '../common/Button';

const StudentProfileForm = ({ profile, onSave }) => (
  <form className="stack-form" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
    <div className="form-grid">
      <Input label="Full name" value={profile.name} />
      <Input label="Email" type="email" value={profile.email} />
      <Input label="Phone" value={profile.phone} />
      <Input label="College" value={profile.college} />
      <Input label="Degree" value={profile.degree} />
      <Input label="Branch" value={profile.branch} />
      <Input label="Graduation year" value={profile.graduationYear} />
      <Input label="GitHub profile" value={profile.github} />
      <Input label="LinkedIn profile" value={profile.linkedin} />
    </div>
    <Button type="submit">Save profile</Button>
  </form>
);

export default StudentProfileForm;
