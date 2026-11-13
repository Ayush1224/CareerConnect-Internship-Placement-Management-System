export const companyProfiles = [
  {
    id: 'c1',
    name: 'Microsoft',
    industry: 'Technology',
    location: 'Bengaluru, India',
    website: 'https://microsoft.com',
    email: 'careers@microsoft.com',
    phone: '+91 9876543210',
    logo: 'MS',
    description: 'Empowering every person and every organization on the planet to achieve more.'
  },
  {
    id: 'c2',
    name: 'Google',
    industry: 'Software',
    location: 'Hyderabad, India',
    website: 'https://google.com',
    email: 'hiring@google.com',
    phone: '+91 9876543211',
    logo: 'GO',
    description: 'Building products and platforms that help people and businesses grow.'
  },
  {
    id: 'c3',
    name: 'Infosys',
    industry: 'Consulting',
    location: 'Pune, India',
    website: 'https://infosys.com',
    email: 'campus@infosys.com',
    phone: '+91 9876543212',
    logo: 'IN',
    description: 'Digital transformation, consulting, and technology services for global clients.'
  },
  {
    id: 'c4',
    name: 'Amazon',
    industry: 'E-Commerce',
    location: 'Chennai, India',
    website: 'https://amazon.in',
    email: 'recruiting@amazon.in',
    phone: '+91 9876543213',
    logo: 'AZ',
    description: 'Delivering customer-centric innovations, operations and cloud services.'
  }
];

export const jobs = [
  {
    id: 'j1',
    title: 'Frontend Engineer Intern',
    companyId: 'c1',
    company: 'Microsoft',
    location: 'Bengaluru',
    type: 'Internship',
    datePosted: '2026-11-12',
    salary: '₹40,000 / month',
    deadline: '2026-12-05',
    experience: '0-1 years',
    description: 'Build modern UI experiences for productivity tools and internal web applications. Work closely with design and engineering teams to implement responsive interfaces.',
    skills: ['React', 'CSS', 'JavaScript', 'Figma', 'Git'],
    vacancies: 5,
    featured: true,
    applicants: 32,
    status: 'Open'
  },
  {
    id: 'j2',
    title: 'Software Development Engineer',
    companyId: 'c2',
    company: 'Google',
    location: 'Hyderabad',
    type: 'Full Time',
    datePosted: '2026-11-08',
    salary: '₹18 LPA',
    deadline: '2026-11-30',
    experience: '1-3 years',
    description: 'Create scalable systems and delightful product experiences. You will contribute to building backend and frontend features with high impact.',
    skills: ['JavaScript', 'Node.js', 'React', 'System Design', 'Testing'],
    vacancies: 3,
    featured: true,
    applicants: 48,
    status: 'Open'
  },
  {
    id: 'j3',
    title: 'Data Analyst Intern',
    companyId: 'c3',
    company: 'Infosys',
    location: 'Pune',
    type: 'Internship',
    datePosted: '2026-11-05',
    salary: '₹25,000 / month',
    deadline: '2026-11-28',
    experience: '0-1 years',
    description: 'Analyze business and product data, create dashboards, and support analytics teams with reporting and insights.',
    skills: ['SQL', 'Excel', 'Power BI', 'Python'],
    vacancies: 8,
    featured: false,
    applicants: 26,
    status: 'Open'
  },
  {
    id: 'j4',
    title: 'Product Designer',
    companyId: 'c4',
    company: 'Amazon',
    location: 'Remote',
    type: 'Contract',
    datePosted: '2026-10-29',
    salary: '₹12 LPA',
    deadline: '2026-12-10',
    experience: '2-4 years',
    description: 'Design user-centered experiences for customer-facing commerce features and internal tools across multiple regions.',
    skills: ['Figma', 'UX Research', 'Design Systems', 'Prototyping'],
    vacancies: 2,
    featured: true,
    applicants: 22,
    status: 'Open'
  }
];

export const studentProfiles = [
  {
    id: 's1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 9123456780',
    college: 'VIT Vellore',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduationYear: 2027,
    skills: ['React', 'Node.js', 'MongoDB', 'Python'],
    github: 'https://github.com/aarav',
    linkedin: 'https://linkedin.com/in/aarav',
    resume: 'Aarav_Resume.pdf',
    profileCompleted: 82,
    status: 'Active'
  },
  {
    id: 's2',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 9876543214',
    college: 'NIT Trichy',
    degree: 'B.E.',
    branch: 'Electronics',
    graduationYear: 2026,
    skills: ['JavaScript', 'SQL', 'Data Analysis', 'Tableau'],
    github: 'https://github.com/priya',
    linkedin: 'https://linkedin.com/in/priya',
    resume: 'Priya_Resume.pdf',
    profileCompleted: 76,
    status: 'Active'
  }
];

export const applications = [
  {
    id: 'a1',
    studentId: 's1',
    jobId: 'j1',
    company: 'Microsoft',
    jobTitle: 'Frontend Engineer Intern',
    appliedOn: '2026-11-07',
    status: 'Shortlisted',
    score: 91
  },
  {
    id: 'a2',
    studentId: 's1',
    jobId: 'j2',
    company: 'Google',
    jobTitle: 'Software Development Engineer',
    appliedOn: '2026-11-03',
    status: 'Pending',
    score: 74
  },
  {
    id: 'a3',
    studentId: 's2',
    jobId: 'j3',
    company: 'Infosys',
    jobTitle: 'Data Analyst Intern',
    appliedOn: '2026-11-01',
    status: 'Selected',
    score: 88
  }
];

export const notifications = [
  {
    id: 'n1',
    title: 'Shortlist update',
    message: 'Microsoft shortlisted you for the Frontend Engineer Intern role.',
    time: '2 hours ago',
    read: false,
    type: 'Application'
  },
  {
    id: 'n2',
    title: 'New internship alert',
    message: 'A new Product Design internship has been posted for your skills.',
    time: '1 day ago',
    read: false,
    type: 'Job'
  },
  {
    id: 'n3',
    title: 'Profile reminder',
    message: 'Complete your resume and skill section to increase match score.',
    time: '3 days ago',
    read: true,
    type: 'Profile'
  }
];

export const adminStats = {
  totalStudents: 1284,
  totalCompanies: 246,
  totalJobs: 389,
  totalApplications: 5400,
  pendingVerifications: 18
};

export const ctaStats = [
  { label: 'Internships posted', value: '12K+' },
  { label: 'Students placed', value: '24K' },
  { label: 'Hiring partners', value: '980+' },
  { label: 'Success rate', value: '94%' }
];

export const platformTestimonials = [
  {
    name: 'Riya Mehta',
    role: 'Software Engineer Intern',
    quote: 'CareerConnect made my internship search seamless and gave me exposure to companies I never thought I could access.'
  },
  {
    name: 'Karan Singh',
    role: 'Product Analyst',
    quote: 'The platform is intuitive, fast and genuinely helps students connect with employers who match their goals.'
  },
  {
    name: 'Neha Fernandez',
    role: 'Placement Coordinator',
    quote: 'Recruiters can discover quality talent quickly and keep the hiring pipeline organized from day one.'
  }
];

export const dashboardCards = {
  student: [
    { label: 'Profile completion', value: '82%', change: '+8% from last month' },
    { label: 'Total applications', value: '14', change: '3 active' },
    { label: 'Shortlisted', value: '5', change: '2 interviews' },
    { label: 'Pending', value: '7', change: 'In review' },
    { label: 'Selected', value: '2', change: 'New offers' }
  ],
  company: [
    { label: 'Job postings', value: '24', change: '6 active' },
    { label: 'Applicants', value: '312', change: '+48 this week' },
    { label: 'Shortlisted', value: '46', change: '14 interviews' },
    { label: 'Open roles', value: '9', change: '3 urgent' }
  ],
  admin: [
    { label: 'Students', value: '1284', change: '+42 this week' },
    { label: 'Companies', value: '246', change: '+8 verified' },
    { label: 'Jobs', value: '389', change: '+21 new' },
    { label: 'Applications', value: '5400', change: '12% growth' }
  ]
};

export const footerLinks = {
  company: ['About us', 'Careers', 'Press', 'Support'],
  resources: ['Blog', 'Guides', 'Partners', 'Privacy'],
  legal: ['Terms', 'Security', 'Cookie Policy', 'Accessibility']
};

export const sidebarMenu = {
  student: [
    { label: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Profile', path: '/student/profile', icon: 'UserRound' },
    { label: 'Browse Jobs', path: '/student/jobs', icon: 'BriefcaseBusiness' },
    { label: 'My Applications', path: '/student/applications', icon: 'FileText' },
    { label: 'Interviews', path: '/student/interviews', icon: 'CalendarDays' },
    { label: 'Saved Jobs', path: '/student/saved-jobs', icon: 'Bookmark' },
    { label: 'Notifications', path: '/student/notifications', icon: 'Bell' },
    { label: 'Settings', path: '/student/settings', icon: 'Settings' },
    { label: 'Logout', path: '/', icon: 'LogOut' }
  ],
  company: [
    { label: 'Dashboard', path: '/company/dashboard', icon: 'LayoutDashboard' },
    { label: 'Company Profile', path: '/company/profile', icon: 'Building2' },
    { label: 'Manage Jobs', path: '/company/jobs', icon: 'BriefcaseBusiness' },
    { label: 'Post New Job', path: '/company/jobs/create', icon: 'PlusCircle' },
    { label: 'Applicants', path: '/company/applicants', icon: 'Users' },
    { label: 'Notifications', path: '/company/notifications', icon: 'Bell' },
    { label: 'Settings', path: '/company/settings', icon: 'Settings' },
    { label: 'Logout', path: '/', icon: 'LogOut' }
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Manage Students', path: '/admin/students', icon: 'GraduationCap' },
    { label: 'Manage Companies', path: '/admin/companies', icon: 'Building2' },
    { label: 'Manage Jobs', path: '/admin/jobs', icon: 'BriefcaseBusiness' },
    { label: 'Applications', path: '/admin/applications', icon: 'FileText' },
    { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
    { label: 'Logout', path: '/', icon: 'LogOut' }
  ]
};
