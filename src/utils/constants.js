const apiOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
export const API_BASE_URL = apiOrigin.endsWith('/api') ? apiOrigin : `${apiOrigin}/api`;

export const ROUTES = {
  home: '/',
  about: '/about',
  contact: '/contact',
  jobs: '/jobs',
  jobDetails: '/jobs/:id',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  studentDashboard: '/student/dashboard',
  studentProfile: '/student/profile',
  studentJobs: '/student/jobs',
  studentApplications: '/student/applications',
  studentSavedJobs: '/student/saved-jobs',
  studentNotifications: '/student/notifications',
  companyDashboard: '/company/dashboard',
  companyProfile: '/company/profile',
  companyJobs: '/company/jobs',
  companyCreateJob: '/company/jobs/create',
  companyApplicants: '/company/applicants',
  companyNotifications: '/company/notifications',
  adminDashboard: '/admin/dashboard',
  adminStudents: '/admin/students',
  adminCompanies: '/admin/companies',
  adminJobs: '/admin/jobs',
  adminApplications: '/admin/applications'
};
