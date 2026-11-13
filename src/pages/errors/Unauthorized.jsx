import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <section className="page-shell text-center">
    <div className="container narrow">
      <ShieldAlert size={56} className="error-icon" />
      <h1>Access denied</h1>
      <p>You do not have permission to view this page.</p>
      <Link to="/" className="btn btn--primary">Back to home</Link>
    </div>
  </section>
);

export default Unauthorized;
