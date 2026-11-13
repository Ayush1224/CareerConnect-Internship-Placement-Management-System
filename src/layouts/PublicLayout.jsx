import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const PublicLayout = () => (
  <div className="app-shell">
    <Navbar />
    <main><Outlet /></main>
    <Footer />
  </div>
);

export default PublicLayout;
