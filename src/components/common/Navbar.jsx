import { Link, NavLink } from 'react-router-dom';
import { Building2, Menu } from 'lucide-react';
import { useState } from 'react';
import Button from './Button';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' }
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand">
          <span className="brand__mark"><Building2 size={18} /></span>
          <span>CareerConnect</span>
        </Link>

        <nav className={`nav ${mobileOpen ? 'nav--open' : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="text-link">Login</Link>
          <Button to="/register" variant="primary">Get Started</Button>
        </div>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
