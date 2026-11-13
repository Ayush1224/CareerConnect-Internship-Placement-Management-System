import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';
import Interview from '../models/Interview.js';
import { connectToDemoDatabase, upsertSeedUser, validateSeedPassword } from './seedHelpers.js';

const samplePassword = process.env.SEED_PASSWORD;

const upsert = (Model, filter, values) =>
  Model.findOneAndUpdate(filter, { $setOnInsert: values }, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true
  });

const ensureUser = (user) => upsertSeedUser({ ...user, password: samplePassword });

const seedData = async () => {
  validateSeedPassword(samplePassword, 'SEED_PASSWORD');
  await connectToDemoDatabase();

  try {
    await Promise.all([
      User,
      StudentProfile,
      Company,
      Job,
      Application,
      SavedJob,
      Notification,
      Interview
    ].map((Model) => Model.init()));

    const studentUsers = await Promise.all([
      ensureUser({ name: 'Avery Shah', email: 'avery.shah@careerconnect.example', role: 'student' }),
      ensureUser({ name: 'Jordan Lee', email: 'jordan.lee@careerconnect.example', role: 'student' }),
      ensureUser({ name: 'Morgan Patel', email: 'morgan.patel@careerconnect.example', role: 'student' })
    ]);
    const companyUsers = await Promise.all([
      ensureUser({ name: 'Northstar Labs Recruiter', email: 'talent@northstar.example', role: 'company' }),
      ensureUser({ name: 'Greenfield Systems Recruiter', email: 'careers@greenfield.example', role: 'company' })
    ]);

    const studentProfiles = await Promise.all([
      upsert(StudentProfile, { userId: studentUsers[0]._id }, {
        userId: studentUsers[0]._id,
        college: 'Westlake Institute of Technology',
        degree: 'Bachelor of Technology',
        branch: 'Computer Science',
        graduationYear: 2027,
        skills: ['JavaScript', 'React', 'Node.js'],
        resume: 'https://example.com/resumes/avery-shah.pdf',
        github: 'https://github.com/avery-shah',
        location: 'Pune, India'
      }),
      upsert(StudentProfile, { userId: studentUsers[1]._id }, {
        userId: studentUsers[1]._id,
        college: 'Riverside University',
        degree: 'Bachelor of Engineering',
        branch: 'Information Technology',
        graduationYear: 2026,
        skills: ['Python', 'MongoDB', 'Express'],
        resume: 'https://example.com/resumes/jordan-lee.pdf',
        linkedin: 'https://www.linkedin.com/in/jordan-lee',
        location: 'Bengaluru, India'
      })
    ]);

    const companies = await Promise.all([
      upsert(Company, { userId: companyUsers[0]._id }, {
        userId: companyUsers[0]._id,
        companyName: 'Northstar Labs',
        website: 'https://northstar.example',
        industry: 'Software',
        location: 'Pune, India',
        description: 'A fictional product engineering company.',
        contactEmail: 'talent@northstar.example'
      }),
      upsert(Company, { userId: companyUsers[1]._id }, {
        userId: companyUsers[1]._id,
        companyName: 'Greenfield Systems',
        website: 'https://greenfield.example',
        industry: 'Clean Technology',
        location: 'Bengaluru, India',
        description: 'A fictional clean technology company.',
        contactEmail: 'careers@greenfield.example'
      })
    ]);

    const jobDetails = [
      { company: 0, title: 'Frontend Engineering Intern', jobType: 'Internship', location: 'Pune, India', stipend: 22000, skillsRequired: ['React', 'JavaScript'] },
      { company: 0, title: 'Backend Engineering Intern', jobType: 'Internship', location: 'Remote', stipend: 25000, skillsRequired: ['Node.js', 'MongoDB'] },
      { company: 0, title: 'Full Stack Developer', jobType: 'Full-time', location: 'Pune, India', salary: 900000, skillsRequired: ['React', 'Node.js'] },
      { company: 1, title: 'Data Analyst Intern', jobType: 'Internship', location: 'Bengaluru, India', stipend: 20000, skillsRequired: ['Python', 'SQL'] },
      { company: 1, title: 'Platform Support Associate', jobType: 'Part-time', location: 'Remote', salary: 300000, skillsRequired: ['Communication', 'Linux'] }
    ];
    const jobs = await Promise.all(jobDetails.map((details) => upsert(
      Job,
      { companyId: companies[details.company]._id, title: details.title },
      {
        companyId: companies[details.company]._id,
        title: details.title,
        description: `Fictional development opening: ${details.title}.`,
        requirements: 'Relevant coursework or equivalent project experience.',
        skillsRequired: details.skillsRequired,
        jobType: details.jobType,
        location: details.location,
        salary: details.salary,
        stipend: details.stipend,
        experience: 'Entry level',
        vacancies: 2,
        applicationDeadline: new Date('2027-06-30T23:59:59.000Z'),
        status: 'Active'
      }
    )));

    const applicationDetails = [
      { student: 0, job: 0 },
      { student: 1, job: 1 },
      { student: 2, job: 3 }
    ];
    const applications = await Promise.all(applicationDetails.map(({ student, job }) =>
      upsert(Application, {
        studentId: studentUsers[student]._id,
        jobId: jobs[job]._id
      }, {
        studentId: studentUsers[student]._id,
        jobId: jobs[job]._id,
        companyId: companies[job < 3 ? 0 : 1]._id,
        resume: studentProfiles[student < 2 ? student : 0].resume,
        coverLetter: 'I am excited to contribute and learn in this fictional role.',
        status: 'Applied'
      })
    ));

    await Promise.all([
      upsert(SavedJob, { studentId: studentUsers[0]._id, jobId: jobs[1]._id }, {
        studentId: studentUsers[0]._id,
        jobId: jobs[1]._id
      }),
      upsert(SavedJob, { studentId: studentUsers[1]._id, jobId: jobs[4]._id }, {
        studentId: studentUsers[1]._id,
        jobId: jobs[4]._id
      })
    ]);

    const notificationDetails = [
      { userId: studentUsers[0]._id, title: 'Application received', message: 'Your application was received.', type: 'Application' },
      { userId: studentUsers[1]._id, title: 'New opportunity', message: 'A new fictional role is available.', type: 'Job' },
      { userId: studentUsers[2]._id, title: 'Welcome', message: 'Welcome to CareerConnect.', type: 'System' }
    ];
    await Promise.all(notificationDetails.map((notification) =>
      upsert(Notification, notification, notification)
    ));

    await upsert(Interview, {
      applicationId: applications[0]._id,
      scheduledAt: new Date('2027-01-15T10:00:00.000Z')
    }, {
      applicationId: applications[0]._id,
      studentId: studentUsers[0]._id,
      companyId: companies[0]._id,
      scheduledAt: new Date('2027-01-15T10:00:00.000Z'),
      meetingLink: 'https://example.com/meet/northstar-interview',
      notes: 'Fictional introductory interview.',
      status: 'Scheduled'
    });

    console.log('Sample CareerConnect data seeded without replacing existing records.');
    console.log(`Created or reused: ${studentUsers.length} students, ${companies.length} companies, 2 student profiles, ${jobs.length} jobs, ${applications.length} applications, 2 saved jobs, 3 notifications, 1 interview.`);
    console.log(`Database selected: ${mongoose.connection.name}`);
  } finally {
    await mongoose.disconnect();
  }
};

seedData().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
