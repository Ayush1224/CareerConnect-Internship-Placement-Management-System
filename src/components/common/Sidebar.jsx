import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';

const iconMap = {
  LayoutDashboard: Icons.LayoutDashboard,
  UserRound: Icons.UserRound,
  BriefcaseBusiness: Icons.BriefcaseBusiness,
  FileText: Icons.FileText,
  Bookmark: Icons.Bookmark,
  Bell: Icons.Bell,
  Settings: Icons.Settings,
  LogOut: Icons.LogOut,
  Building2: Icons.Building2,
  PlusCircle: Icons.PlusCircle,
  Users: Icons.Users,
  GraduationCap: Icons.GraduationCap,
  CalendarDays: Icons.CalendarDays
};

const Sidebar = ({ items, title, onLogout }) => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h2>{title}</h2>
      </div>
      <nav className="sidebar__nav">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || Icons.Circle;
          if (item.icon === 'LogOut' && onLogout) {
            return (
              <button key={item.label} type="button" className="sidebar__link" onClick={onLogout}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          }
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`sidebar__link ${active ? 'is-active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
