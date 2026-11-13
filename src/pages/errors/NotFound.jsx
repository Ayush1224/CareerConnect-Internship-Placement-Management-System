import { Link } from 'react-router-dom';

const NotFound = () => (
  <section className="page-shell text-center">
    <div className="container narrow">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>The page you’re looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn btn--primary">Go to homepage</Link>
    </div>
  </section>
);

export default NotFound;
