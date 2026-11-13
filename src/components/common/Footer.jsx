import { Link } from 'react-router-dom';
import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import { footerLinks } from '../../data/mockData';

const Footer = () => (
  <footer className="site-footer">
    <div className="container footer-grid">
      <div>
        <Link to="/" className="brand brand--footer">
          <span className="brand__mark"><Building2 size={18} /></span>
          <span>CareerConnect</span>
        </Link>
        <p className="footer-copy">Connecting ambitious students with the right internship and career opportunities.</p>
        <div className="footer-contact">
          <span><Mail size={15} /> hello@careerconnect.com</span>
          <span><Phone size={15} /> +91 9876543210</span>
          <span><MapPin size={15} /> Bengaluru, India</span>
        </div>
      </div>

      <div>
        <h4>Company</h4>
        <ul className="footer-list">
          {footerLinks.company.map((item) => <li key={item}><Link to="/about">{item}</Link></li>)}
        </ul>
      </div>
      <div>
        <h4>Resources</h4>
        <ul className="footer-list">
          {footerLinks.resources.map((item) => <li key={item}><Link to="/jobs">{item}</Link></li>)}
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <ul className="footer-list">
          {footerLinks.legal.map((item) => <li key={item}><Link to="/contact">{item}</Link></li>)}
        </ul>
      </div>
    </div>
    <div className="container footer-bottom">
      <span>© 2026 CareerConnect. All rights reserved.</span>
    </div>
  </footer>
);

export default Footer;
