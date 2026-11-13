import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';
import CompanyLayout from '../layouts/CompanyLayout';
import AdminLayout from '../layouts/AdminLayout';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Loader from '../components/common/Loader';
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Jobs from '../pages/public/Jobs';
import JobDetails from '../pages/public/JobDetails';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentProfile from '../pages/student/StudentProfile';
import BrowseJobs from '../pages/student/BrowseJobs';
import MyApplications from '../pages/student/MyApplications';
import Interviews from '../pages/student/Interviews';
import SavedJobs from '../pages/student/SavedJobs';
import Notifications from '../pages/student/Notifications';
import CompanyDashboard from '../pages/company/CompanyDashboard';
import CompanyProfile from '../pages/company/CompanyProfile';
import ManageJobs from '../pages/company/ManageJobs';
import CreateJob from '../pages/company/CreateJob';
import ViewApplicants from '../pages/company/ViewApplicants';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageStudents from '../pages/admin/ManageStudents';
import ManageCompanies from '../pages/admin/ManageCompanies';
import ManageApplications from '../pages/admin/ManageApplications';
import Unauthorized from '../pages/errors/Unauthorized';
import NotFound from '../pages/errors/NotFound';

const AppRoutesContent = () => {
  const { user, loading } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'company') return '/company/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/unauthorized';
  };

  if (loading) return <Loader text="Checking your session..." />;

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/login" element={user ? <Navigate to={getDashboardPath()} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={getDashboardPath()} replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      <Route path="/student/*" element={<ProtectedRoute allow="student"><StudentLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="jobs" element={<BrowseJobs />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="saved-jobs" element={<SavedJobs />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="/company/*" element={<ProtectedRoute allow="company"><CompanyLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<CompanyDashboard />} />
        <Route path="profile" element={<CompanyProfile />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="jobs/create" element={<CreateJob />} />
        <Route path="jobs/:jobId/applicants" element={<ViewApplicants />} />
        <Route path="applicants" element={<ViewApplicants />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="/admin/*" element={<ProtectedRoute allow="admin"><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="companies" element={<ManageCompanies />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="applications" element={<ManageApplications />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppRoutes = () => (
  <AuthProvider>
    <AppRoutesContent />
  </AuthProvider>
);

export default AppRoutes;
