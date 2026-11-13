/* global use, db, ObjectId, console */
use("careerconnect");

if (db.getName() !== "careerconnect") {
  throw new Error(`Wrong database selected: ${db.getName()}`);
}

const ids = {
  users: {
    admin: ObjectId("650000000000000000000001"),
    avery: ObjectId("650000000000000000000002"),
    jordan: ObjectId("650000000000000000000003"),
    morgan: ObjectId("650000000000000000000004"),
    northstarRecruiter: ObjectId("650000000000000000000005"),
    greenfieldRecruiter: ObjectId("650000000000000000000006")
  },
  profiles: {
    avery: ObjectId("650000000000000000000101"),
    jordan: ObjectId("650000000000000000000102"),
    morgan: ObjectId("650000000000000000000103")
  },
  companies: {
    northstar: ObjectId("650000000000000000000201"),
    greenfield: ObjectId("650000000000000000000202")
  },
  jobs: {
    frontend: ObjectId("650000000000000000000301"),
    backend: ObjectId("650000000000000000000302"),
    fullstack: ObjectId("650000000000000000000303"),
    analyst: ObjectId("650000000000000000000304"),
    support: ObjectId("650000000000000000000305")
  },
  applications: {
    avery: ObjectId("650000000000000000000401"),
    jordan: ObjectId("650000000000000000000402"),
    morgan: ObjectId("650000000000000000000403")
  },
  savedjobs: {
    avery: ObjectId("650000000000000000000501"),
    jordan: ObjectId("650000000000000000000502")
  },
  notifications: {
    application: ObjectId("650000000000000000000601"),
    job: ObjectId("650000000000000000000602"),
    welcome: ObjectId("650000000000000000000603")
  },
  interview: ObjectId("650000000000000000000701")
};
const stamp = new Date("2026-11-12T00:00:00.000Z");
const at = (value) => new Date(value);

const batches = [
  {
    collection: "users",
    uniqueKeys: [["email"]],
    docs: [
      { _id: ids.users.admin, name: "CareerConnect Development Admin", email: "admin.seed@careerconnect.example", password: "DUMMY-ONLY-DO-NOT-USE-admin", phone: "+1-555-0101", role: "admin", isActive: true, createdAt: stamp, updatedAt: stamp },
      { _id: ids.users.avery, name: "Avery Shah", email: "avery.shah@careerconnect.example", password: "DUMMY-ONLY-DO-NOT-USE-avery", phone: "+1-555-0102", role: "student", isActive: true, createdAt: stamp, updatedAt: stamp },
      { _id: ids.users.jordan, name: "Jordan Lee", email: "jordan.lee@careerconnect.example", password: "DUMMY-ONLY-DO-NOT-USE-jordan", phone: "+1-555-0103", role: "student", isActive: true, createdAt: stamp, updatedAt: stamp },
      { _id: ids.users.morgan, name: "Morgan Patel", email: "morgan.patel@careerconnect.example", password: "DUMMY-ONLY-DO-NOT-USE-morgan", phone: "+1-555-0104", role: "student", isActive: true, createdAt: stamp, updatedAt: stamp },
      { _id: ids.users.northstarRecruiter, name: "Northstar Labs Recruiter", email: "talent@northstar.example", password: "DUMMY-ONLY-DO-NOT-USE-northstar", phone: "+1-555-0105", role: "company", isActive: true, createdAt: stamp, updatedAt: stamp },
      { _id: ids.users.greenfieldRecruiter, name: "Greenfield Systems Recruiter", email: "careers@greenfield.example", password: "DUMMY-ONLY-DO-NOT-USE-greenfield", phone: "+1-555-0106", role: "company", isActive: true, createdAt: stamp, updatedAt: stamp }
    ]
  },
  {
    collection: "studentprofiles",
    uniqueKeys: [["userId"]],
    docs: [
      { _id: ids.profiles.avery, userId: ids.users.avery, profileImage: "https://assets.careerconnect.example/avery.jpg", college: "Westlake Institute of Technology", degree: "Bachelor of Technology", branch: "Computer Science", graduationYear: 2027, skills: ["JavaScript", "React", "Node.js"], resume: "https://files.careerconnect.example/resumes/avery-shah.pdf", github: "https://github.com/avery-shah", linkedin: "https://www.linkedin.com/in/avery-shah", portfolio: "https://avery-shah.example", bio: "Computer science student interested in accessible web applications.", location: "Pune, India" },
      { _id: ids.profiles.jordan, userId: ids.users.jordan, profileImage: "https://assets.careerconnect.example/jordan.jpg", college: "Riverside University", degree: "Bachelor of Engineering", branch: "Information Technology", graduationYear: 2026, skills: ["Python", "MongoDB", "Express"], resume: "https://files.careerconnect.example/resumes/jordan-lee.pdf", github: "https://github.com/jordan-lee", linkedin: "https://www.linkedin.com/in/jordan-lee", bio: "Final-year student building data-driven applications.", location: "Bengaluru, India" },
      { _id: ids.profiles.morgan, userId: ids.users.morgan, profileImage: "https://assets.careerconnect.example/morgan.jpg", college: "Cedar Valley College", degree: "Bachelor of Science", branch: "Data Science", graduationYear: 2027, skills: ["Python", "SQL", "Pandas"], resume: "https://files.careerconnect.example/resumes/morgan-patel.pdf", github: "https://github.com/morgan-patel", linkedin: "https://www.linkedin.com/in/morgan-patel", portfolio: "https://morgan-patel.example", bio: "Data science student focused on practical analytics and visualization.", location: "Hyderabad, India" }
    ]
  },
  {
    collection: "companies",
    uniqueKeys: [["userId"]],
    docs: [
      { _id: ids.companies.northstar, userId: ids.users.northstarRecruiter, companyName: "Northstar Labs", logo: "https://assets.northstar.example/logo.png", website: "https://northstar.example", industry: "Software", location: "Pune, India", description: "A fictional product engineering company building collaboration tools.", contactEmail: "talent@northstar.example", verified: true },
      { _id: ids.companies.greenfield, userId: ids.users.greenfieldRecruiter, companyName: "Greenfield Systems", logo: "https://assets.greenfield.example/logo.png", website: "https://greenfield.example", industry: "Clean Technology", location: "Bengaluru, India", description: "A fictional clean technology company developing energy monitoring software.", contactEmail: "careers@greenfield.example", verified: true }
    ]
  },
  {
    collection: "jobs",
    uniqueKeys: [],
    docs: [
      { _id: ids.jobs.frontend, companyId: ids.companies.northstar, title: "Frontend Engineering Intern", description: "Build and test user-facing features with an experienced product team.", requirements: "Coursework or project experience in modern web development.", skillsRequired: ["React", "JavaScript", "CSS"], jobType: "Internship", location: "Pune, India", stipend: 22000, experience: "Entry level", vacancies: 2, applicationDeadline: at("2027-05-31T23:59:59.000Z"), status: "Active" },
      { _id: ids.jobs.backend, companyId: ids.companies.northstar, title: "Backend Engineering Intern", description: "Help implement APIs and data services for fictional collaboration products.", requirements: "Familiarity with REST APIs and a database is helpful.", skillsRequired: ["Node.js", "MongoDB", "Express"], jobType: "Internship", location: "Remote", stipend: 25000, experience: "Entry level", vacancies: 1, applicationDeadline: at("2027-06-15T23:59:59.000Z"), status: "Active" },
      { _id: ids.jobs.fullstack, companyId: ids.companies.northstar, title: "Full Stack Developer", description: "Develop and maintain frontend and backend features for a fictional SaaS platform.", requirements: "Demonstrated project experience with a JavaScript stack.", skillsRequired: ["React", "Node.js", "MongoDB"], jobType: "Full-time", location: "Pune, India", salary: 900000, experience: "0-2 years", vacancies: 2, applicationDeadline: at("2027-07-01T23:59:59.000Z"), status: "Active" },
      { _id: ids.jobs.analyst, companyId: ids.companies.greenfield, title: "Data Analyst Intern", description: "Explore energy usage datasets and create clear analytical reports.", requirements: "Basic statistics, spreadsheet, or programming experience.", skillsRequired: ["Python", "SQL", "Data Visualization"], jobType: "Internship", location: "Bengaluru, India", stipend: 20000, experience: "Entry level", vacancies: 2, applicationDeadline: at("2027-06-20T23:59:59.000Z"), status: "Active" },
      { _id: ids.jobs.support, companyId: ids.companies.greenfield, title: "Platform Support Associate", description: "Support customers using a fictional energy monitoring platform.", requirements: "Clear communication and an interest in technical troubleshooting.", skillsRequired: ["Communication", "Linux", "Customer Support"], jobType: "Part-time", location: "Remote", salary: 300000, experience: "Entry level", vacancies: 1, applicationDeadline: at("2027-07-15T23:59:59.000Z"), status: "Draft" }
    ]
  },
  {
    collection: "applications",
    uniqueKeys: [["studentId", "jobId"]],
    docs: [
      { _id: ids.applications.avery, studentId: ids.users.avery, jobId: ids.jobs.frontend, companyId: ids.companies.northstar, resume: "https://files.careerconnect.example/resumes/avery-shah.pdf", coverLetter: "I am excited to contribute to the fictional Northstar product team.", status: "Applied", appliedAt: at("2026-10-15T09:00:00.000Z"), updatedAt: at("2026-10-15T09:00:00.000Z") },
      { _id: ids.applications.jordan, studentId: ids.users.jordan, jobId: ids.jobs.backend, companyId: ids.companies.northstar, resume: "https://files.careerconnect.example/resumes/jordan-lee.pdf", coverLetter: "My API and database projects have prepared me for this internship.", status: "Shortlisted", appliedAt: at("2026-10-16T10:30:00.000Z"), updatedAt: at("2026-10-20T12:00:00.000Z") },
      { _id: ids.applications.morgan, studentId: ids.users.morgan, jobId: ids.jobs.analyst, companyId: ids.companies.greenfield, resume: "https://files.careerconnect.example/resumes/morgan-patel.pdf", coverLetter: "I would enjoy turning energy data into useful insights.", status: "Applied", appliedAt: at("2026-10-18T08:15:00.000Z"), updatedAt: at("2026-10-18T08:15:00.000Z") }
    ]
  },
  {
    collection: "savedjobs",
    uniqueKeys: [["studentId", "jobId"]],
    docs: [
      { _id: ids.savedjobs.avery, studentId: ids.users.avery, jobId: ids.jobs.backend, savedAt: at("2026-10-12T11:00:00.000Z") },
      { _id: ids.savedjobs.jordan, studentId: ids.users.jordan, jobId: ids.jobs.support, savedAt: at("2026-10-14T14:00:00.000Z") }
    ]
  },
  {
    collection: "notifications",
    uniqueKeys: [],
    docs: [
      { _id: ids.notifications.application, userId: ids.users.avery, title: "Application received", message: "Your application for Frontend Engineering Intern was received.", type: "Application", isRead: false, createdAt: at("2026-10-15T09:01:00.000Z") },
      { _id: ids.notifications.job, userId: ids.users.jordan, title: "New opportunity", message: "A fictional remote engineering internship is available.", type: "Job", isRead: false, createdAt: at("2026-10-16T08:00:00.000Z") },
      { _id: ids.notifications.welcome, userId: ids.users.morgan, title: "Welcome to CareerConnect", message: "Complete your profile to explore fictional opportunities.", type: "System", isRead: true, createdAt: at("2026-10-10T07:30:00.000Z") }
    ]
  },
  {
    collection: "interviews",
    uniqueKeys: [],
    docs: [
      { _id: ids.interview, applicationId: ids.applications.jordan, studentId: ids.users.jordan, companyId: ids.companies.northstar, scheduledAt: at("2027-01-15T10:00:00.000Z"), meetingLink: "https://meet.example.com/northstar-jordan", notes: "Fictional first-round conversation.", status: "Scheduled" }
    ]
  }
];

const collectionNames = new Set(db.getCollectionNames());
const missingCollections = batches
  .map((batch) => batch.collection)
  .filter((name) => !collectionNames.has(name));
if (missingCollections.length > 0) {
  throw new Error(`Run phase 01 first; missing collections: ${missingCollections.join(", ")}`);
}

for (const batch of batches) {
  const collection = db.getCollection(batch.collection);
  for (const document of batch.docs) {
    for (const fields of batch.uniqueKeys) {
      const filter = {};
      for (const field of fields) filter[field] = document[field];
      const conflict = collection.findOne(filter, { _id: 1 });
      if (conflict && String(conflict._id) !== String(document._id)) {
        throw new Error(
          `Sample-data conflict in ${batch.collection} for ${fields.join(", ")}. ` +
          "No sample inserts have started."
        );
      }
    }
  }
}

for (const batch of batches) {
  const collection = db.getCollection(batch.collection);
  const existingIds = new Set(
    collection.find(
      { _id: { $in: batch.docs.map((document) => document._id) } },
      { _id: 1 }
    ).toArray().map((document) => String(document._id))
  );
  const newDocuments = batch.docs.filter((document) => !existingIds.has(String(document._id)));
  if (newDocuments.length > 0) {
    collection.insertMany(newDocuments, { ordered: true });
  }
  console.log(`${batch.collection}: inserted ${newDocuments.length} new sample document(s).`);
}

console.log(`Sample-data phase complete for ${db.getName()}.`);
