import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="page-shell">
      <div className="container contact-layout">
        <div>
          <span className="eyebrow">Contact</span>
          <h1>We’d love to hear from you.</h1>
          <p className="lead">Reach out for partnerships, career support or platform feedback.</p>
          <div className="contact-list">
            <div><Mail size={18} /> hello@careerconnect.com</div>
            <div><Phone size={18} /> +91 9876543210</div>
            <div><MapPin size={18} /> Bengaluru, India</div>
          </div>
        </div>

        <form className="card-form" onSubmit={(event) => event.preventDefault()}>
          <Input label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter your email" />
          <Input label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject" />
          <label className="field">
            <span className="field__label">Message</span>
            <textarea name="message" className="field__input" rows="5" value={form.message} onChange={handleChange} placeholder="Write your message" />
          </label>
          <Button type="submit">Send message</Button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
