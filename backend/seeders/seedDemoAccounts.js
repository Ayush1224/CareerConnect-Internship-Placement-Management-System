import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import { connectToDemoDatabase, upsertSeedUser } from './seedHelpers.js';

const seedDemoAccounts = async () => {
  const {
    DEMO_STUDENT_NAME,
    DEMO_STUDENT_EMAIL,
    DEMO_COMPANY_NAME,
    DEMO_COMPANY_EMAIL,
    SEED_PASSWORD
  } = process.env;
  if (!DEMO_STUDENT_NAME || !DEMO_STUDENT_EMAIL || !DEMO_COMPANY_NAME || !DEMO_COMPANY_EMAIL) {
    throw new Error('DEMO_STUDENT_NAME, DEMO_STUDENT_EMAIL, DEMO_COMPANY_NAME, and DEMO_COMPANY_EMAIL must be configured.');
  }
  if (DEMO_STUDENT_EMAIL.trim().toLowerCase() === DEMO_COMPANY_EMAIL.trim().toLowerCase()) {
    throw new Error('The demo student and company accounts must use different email addresses.');
  }
  if (!SEED_PASSWORD) {
    throw new Error('SEED_PASSWORD must be configured for the demo student and company accounts.');
  }

  await connectToDemoDatabase();
  try {
    await Promise.all([User.init(), StudentProfile.init()]);
    const [student, company] = await Promise.all([
      upsertSeedUser({
        name: DEMO_STUDENT_NAME,
        email: DEMO_STUDENT_EMAIL,
        password: SEED_PASSWORD,
        role: 'student'
      }),
      upsertSeedUser({
        name: DEMO_COMPANY_NAME,
        email: DEMO_COMPANY_EMAIL,
        password: SEED_PASSWORD,
        role: 'company'
      })
    ]);

    await StudentProfile.findOneAndUpdate(
      { userId: student._id },
      {
        $setOnInsert: {
          userId: student._id,
          college: 'Westlake Institute of Technology',
          degree: 'Bachelor of Technology',
          branch: 'Computer Science',
          graduationYear: 2027,
          skills: ['JavaScript', 'React', 'Node.js'],
          resume: 'https://example.com/demo/fictional-student-resume.pdf',
          location: 'Pune, India',
          bio: 'Fictional portfolio demonstration student profile.'
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    console.log(`Demo student account ready: ${student.email}`);
    console.log(`Demo company account ready: ${company.email}`);
    console.log('The student profile includes a fictional resume URL; the company profile is intentionally left for onboarding.');
    console.log(`Database selected: ${mongoose.connection.name}`);
  } finally {
    await mongoose.disconnect();
  }
};

seedDemoAccounts().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
