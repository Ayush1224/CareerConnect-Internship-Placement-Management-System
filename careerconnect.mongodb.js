/* global use, db, ObjectId, console */
// CareerConnect development setup for MongoDB VS Code Playground.
// Run only after selecting the intended Atlas connection in VS Code.
// This script never drops collections or deletes/updates documents.

use("careerconnect");

if (db.getName() !== "careerconnect") {
  throw new Error(`Wrong database selected: ${db.getName()}`);
}

console.log(`Target database: ${db.getName()}`);

// Validators accept the requested field types and enum values.
const validators = {
  users: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password"],
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        phone: { bsonType: "string" },
        role: { bsonType: "string", enum: ["student", "company", "admin"] },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  studentprofiles: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        userId: { bsonType: "objectId" },
        profileImage: { bsonType: "string" },
        college: { bsonType: "string" },
        degree: { bsonType: "string" },
        branch: { bsonType: "string" },
        graduationYear: { bsonType: ["double", "int", "long", "decimal"] },
        skills: { bsonType: "array", items: { bsonType: "string" } },
        resume: { bsonType: "string" },
        github: { bsonType: "string" },
        linkedin: { bsonType: "string" },
        portfolio: { bsonType: "string" },
        bio: { bsonType: "string" },
        location: { bsonType: "string" }
      }
    }
  },
  companies: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "companyName"],
      properties: {
        userId: { bsonType: "objectId" },
        companyName: { bsonType: "string" },
        logo: { bsonType: "string" },
        website: { bsonType: "string" },
        industry: { bsonType: "string" },
        location: { bsonType: "string" },
        description: { bsonType: "string" },
        contactEmail: { bsonType: "string" },
        verified: { bsonType: "bool" }
      }
    }
  },
  jobs: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId", "title", "description"],
      properties: {
        companyId: { bsonType: "objectId" },
        title: { bsonType: "string" },
        description: { bsonType: "string" },
        requirements: { bsonType: "string" },
        skillsRequired: { bsonType: "array", items: { bsonType: "string" } },
        jobType: { bsonType: "string", enum: ["Internship", "Full-time", "Part-time"] },
        location: { bsonType: "string" },
        salary: { bsonType: ["double", "int", "long", "decimal"] },
        stipend: { bsonType: ["double", "int", "long", "decimal"] },
        experience: { bsonType: "string" },
        vacancies: { bsonType: ["double", "int", "long", "decimal"] },
        applicationDeadline: { bsonType: "date" },
        status: { bsonType: "string", enum: ["Active", "Closed", "Draft"] }
      }
    }
  },
  applications: {
    $jsonSchema: {
      bsonType: "object",
      required: ["studentId", "jobId", "companyId"],
      properties: {
        studentId: { bsonType: "objectId" },
        jobId: { bsonType: "objectId" },
        companyId: { bsonType: "objectId" },
        resume: { bsonType: "string" },
        coverLetter: { bsonType: "string" },
        status: { bsonType: "string", enum: ["Applied", "Shortlisted", "Rejected", "Selected"] },
        appliedAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  savedjobs: {
    $jsonSchema: {
      bsonType: "object",
      required: ["studentId", "jobId"],
      properties: {
        studentId: { bsonType: "objectId" },
        jobId: { bsonType: "objectId" },
        savedAt: { bsonType: "date" }
      }
    }
  },
  notifications: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        userId: { bsonType: "objectId" },
        title: { bsonType: "string" },
        message: { bsonType: "string" },
        type: { bsonType: "string", enum: ["Application", "Job", "Interview", "System"] },
        isRead: { bsonType: "bool" },
        createdAt: { bsonType: "date" }
      }
    }
  },
  interviews: {
    $jsonSchema: {
      bsonType: "object",
      required: ["applicationId", "studentId", "companyId"],
      properties: {
        applicationId: { bsonType: "objectId" },
        studentId: { bsonType: "objectId" },
        companyId: { bsonType: "objectId" },
        scheduledAt: { bsonType: "date" },
        meetingLink: { bsonType: "string" },
        notes: { bsonType: "string" },
        status: { bsonType: "string", enum: ["Scheduled", "Completed", "Cancelled"] }
      }
    }
  }
};

// Create missing collections; apply validators to existing ones without changing documents.
for (const [collectionName, validator] of Object.entries(validators)) {
  const collectionInfo = db.getCollectionInfos({ name: collectionName })[0];
  if (!collectionInfo) {
    db.createCollection(collectionName, {
      validator,
      validationLevel: "moderate",
      validationAction: "error"
    });
    console.log(`Created collection with validation: ${collectionName}`);
  } else {
    const result = db.runCommand({
      collMod: collectionName,
      validator,
      validationLevel: "moderate",
      validationAction: "error"
    });
    if (!result.ok) {
      throw new Error(`Could not apply validator to ${collectionName}: ${JSON.stringify(result)}`);
    }
    console.log(`Collection exists; validator applied: ${collectionName}`);
  }
}

// Create required indexes only when an equivalent index is absent.
const indexSpecs = {
  users: [
    { key: { email: 1 }, options: { unique: true } }
  ],
  studentprofiles: [
    { key: { userId: 1 }, options: { unique: true } }
  ],
  companies: [
    { key: { userId: 1 }, options: { unique: true } }
  ],
  jobs: [
    { key: { companyId: 1 }, options: { name: "companyId_1" } },
    { key: { status: 1, location: 1 }, options: { name: "status_1_location_1" } }
  ],
  applications: [
    { key: { studentId: 1, jobId: 1 }, options: { unique: true } },
    { key: { jobId: 1 }, options: { name: "jobId_1" } },
    { key: { companyId: 1 }, options: { name: "companyId_1" } }
  ],
  savedjobs: [
    { key: { studentId: 1, jobId: 1 }, options: { unique: true } }
  ],
  notifications: [
    { key: { userId: 1, isRead: 1 }, options: { name: "userId_1_isRead_1" } }
  ],
  interviews: [
    { key: { applicationId: 1 }, options: { name: "applicationId_1" } },
    { key: { scheduledAt: 1 }, options: { name: "scheduledAt_1" } }
  ]
};

function sameIndexKeys(actual, expected) {
  const actualNames = Object.keys(actual);
  const expectedNames = Object.keys(expected);
  return actualNames.length === expectedNames.length &&
    actualNames.every((key, index) => key === expectedNames[index] && actual[key] === expected[key]);
}

for (const [collectionName, specs] of Object.entries(indexSpecs)) {
  const collection = db.getCollection(collectionName);
  const existingIndexes = collection.getIndexes();
  for (const spec of specs) {
    const matchingIndex = existingIndexes.find((index) => sameIndexKeys(index.key, spec.key));
    if (matchingIndex) {
      if (spec.options.unique && !matchingIndex.unique) {
        throw new Error(
          `Index conflict on ${collectionName}.${Object.keys(spec.key).join("_")}: ` +
          "an equivalent non-unique index exists. Review it manually; this script will not drop or replace it."
        );
      }
      console.log(`Index exists: ${collectionName} ${JSON.stringify(spec.key)}`);
    } else {
      collection.createIndex(spec.key, spec.options);
      console.log(`Created index: ${collectionName} ${JSON.stringify(spec.key)}`);
    }
  }
}

// Stable IDs make this sample dataset safe to re-run without replacing existing documents.
const ids = {
  users: {
    admin: ObjectId("650000000000000000000001"),
    studentAvery: ObjectId("650000000000000000000002"),
    studentJordan: ObjectId("650000000000000000000003"),
    studentMorgan: ObjectId("650000000000000000000004"),
    companyNorthstar: ObjectId("650000000000000000000005"),
    companyGreenfield: ObjectId("650000000000000000000006")
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

const now = new Date();
const sampleUsers = [
  {
    _id: ids.users.admin,
    name: "CareerConnect Development Admin",
    email: "admin.seed@careerconnect.example",
    password: "DUMMY-ONLY-DO-NOT-USE-admin",
    phone: "+1-555-0101",
    role: "admin",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: ids.users.studentAvery,
    name: "Avery Shah",
    email: "avery.shah@careerconnect.example",
    password: "DUMMY-ONLY-DO-NOT-USE-avery",
    phone: "+1-555-0102",
    role: "student",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: ids.users.studentJordan,
    name: "Jordan Lee",
    email: "jordan.lee@careerconnect.example",
    password: "DUMMY-ONLY-DO-NOT-USE-jordan",
    phone: "+1-555-0103",
    role: "student",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: ids.users.studentMorgan,
    name: "Morgan Patel",
    email: "morgan.patel@careerconnect.example",
    password: "DUMMY-ONLY-DO-NOT-USE-morgan",
    phone: "+1-555-0104",
    role: "student",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: ids.users.companyNorthstar,
    name: "Northstar Labs Recruiter",
    email: "talent@northstar.example",
    password: "DUMMY-ONLY-DO-NOT-USE-northstar",
    phone: "+1-555-0105",
    role: "company",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: ids.users.companyGreenfield,
    name: "Greenfield Systems Recruiter",
    email: "careers@greenfield.example",
    password: "DUMMY-ONLY-DO-NOT-USE-greenfield",
    phone: "+1-555-0106",
    role: "company",
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

const sampleStudentProfiles = [
  {
    _id: ids.profiles.avery,
    userId: ids.users.studentAvery,
    profileImage: "https://assets.careerconnect.example/avery.jpg",
    college: "Westlake Institute of Technology",
    degree: "Bachelor of Technology",
    branch: "Computer Science",
    graduationYear: 2027,
    skills: ["JavaScript", "React", "Node.js"],
    resume: "https://files.careerconnect.example/resumes/avery-shah.pdf",
    github: "https://github.com/avery-shah",
    linkedin: "https://www.linkedin.com/in/avery-shah",
    portfolio: "https://avery-shah.example",
    bio: "Computer science student interested in accessible web applications.",
    location: "Pune, India"
  },
  {
    _id: ids.profiles.jordan,
    userId: ids.users.studentJordan,
    profileImage: "https://assets.careerconnect.example/jordan.jpg",
    college: "Riverside University",
    degree: "Bachelor of Engineering",
    branch: "Information Technology",
    graduationYear: 2026,
    skills: ["Python", "MongoDB", "Express"],
    resume: "https://files.careerconnect.example/resumes/jordan-lee.pdf",
    github: "https://github.com/jordan-lee",
    linkedin: "https://www.linkedin.com/in/jordan-lee",
    bio: "Final-year student building data-driven applications.",
    location: "Bengaluru, India"
  },
  {
    _id: ids.profiles.morgan,
    userId: ids.users.studentMorgan,
    profileImage: "https://assets.careerconnect.example/morgan.jpg",
    college: "Cedar Valley College",
    degree: "Bachelor of Science",
    branch: "Data Science",
    graduationYear: 2027,
    skills: ["Python", "SQL", "Pandas"],
    resume: "https://files.careerconnect.example/resumes/morgan-patel.pdf",
    github: "https://github.com/morgan-patel",
    linkedin: "https://www.linkedin.com/in/morgan-patel",
    portfolio: "https://morgan-patel.example",
    bio: "Data science student focused on practical analytics and visualization.",
    location: "Hyderabad, India"
  }
];

const sampleCompanies = [
  {
    _id: ids.companies.northstar,
    userId: ids.users.companyNorthstar,
    companyName: "Northstar Labs",
    logo: "https://assets.northstar.example/logo.png",
    website: "https://northstar.example",
    industry: "Software",
    location: "Pune, India",
    description: "A fictional product engineering company building collaboration tools.",
    contactEmail: "talent@northstar.example",
    verified: true
  },
  {
    _id: ids.companies.greenfield,
    userId: ids.users.companyGreenfield,
    companyName: "Greenfield Systems",
    logo: "https://assets.greenfield.example/logo.png",
    website: "https://greenfield.example",
    industry: "Clean Technology",
    location: "Bengaluru, India",
    description: "A fictional clean technology company developing energy monitoring software.",
    contactEmail: "careers@greenfield.example",
    verified: true
  }
];

const sampleJobs = [
  {
    _id: ids.jobs.frontend,
    companyId: ids.companies.northstar,
    title: "Frontend Engineering Intern",
    description: "Build and test user-facing features with an experienced product team.",
    requirements: "Coursework or project experience in modern web development.",
    skillsRequired: ["React", "JavaScript", "CSS"],
    jobType: "Internship",
    location: "Pune, India",
    stipend: 22000,
    experience: "Entry level",
    vacancies: 2,
    applicationDeadline: new Date("2027-05-31T23:59:59.000Z"),
    status: "Active"
  },
  {
    _id: ids.jobs.backend,
    companyId: ids.companies.northstar,
    title: "Backend Engineering Intern",
    description: "Help implement APIs and data services for fictional collaboration products.",
    requirements: "Familiarity with REST APIs and a database is helpful.",
    skillsRequired: ["Node.js", "MongoDB", "Express"],
    jobType: "Internship",
    location: "Remote",
    stipend: 25000,
    experience: "Entry level",
    vacancies: 1,
    applicationDeadline: new Date("2027-06-15T23:59:59.000Z"),
    status: "Active"
  },
  {
    _id: ids.jobs.fullstack,
    companyId: ids.companies.northstar,
    title: "Full Stack Developer",
    description: "Develop and maintain frontend and backend features for a fictional SaaS platform.",
    requirements: "Demonstrated project experience with a JavaScript stack.",
    skillsRequired: ["React", "Node.js", "MongoDB"],
    jobType: "Full-time",
    location: "Pune, India",
    salary: 900000,
    experience: "0-2 years",
    vacancies: 2,
    applicationDeadline: new Date("2027-07-01T23:59:59.000Z"),
    status: "Active"
  },
  {
    _id: ids.jobs.analyst,
    companyId: ids.companies.greenfield,
    title: "Data Analyst Intern",
    description: "Explore energy usage datasets and create clear analytical reports.",
    requirements: "Basic statistics, spreadsheet, or programming experience.",
    skillsRequired: ["Python", "SQL", "Data Visualization"],
    jobType: "Internship",
    location: "Bengaluru, India",
    stipend: 20000,
    experience: "Entry level",
    vacancies: 2,
    applicationDeadline: new Date("2027-06-20T23:59:59.000Z"),
    status: "Active"
  },
  {
    _id: ids.jobs.support,
    companyId: ids.companies.greenfield,
    title: "Platform Support Associate",
    description: "Support customers using a fictional energy monitoring platform.",
    requirements: "Clear communication and an interest in technical troubleshooting.",
    skillsRequired: ["Communication", "Linux", "Customer Support"],
    jobType: "Part-time",
    location: "Remote",
    salary: 300000,
    experience: "Entry level",
    vacancies: 1,
    applicationDeadline: new Date("2027-07-15T23:59:59.000Z"),
    status: "Draft"
  }
];

const sampleApplications = [
  {
    _id: ids.applications.avery,
    studentId: ids.users.studentAvery,
    jobId: ids.jobs.frontend,
    companyId: ids.companies.northstar,
    resume: "https://files.careerconnect.example/resumes/avery-shah.pdf",
    coverLetter: "I am excited to contribute to the fictional Northstar product team.",
    status: "Applied",
    appliedAt: new Date("2026-10-15T09:00:00.000Z"),
    updatedAt: new Date("2026-10-15T09:00:00.000Z")
  },
  {
    _id: ids.applications.jordan,
    studentId: ids.users.studentJordan,
    jobId: ids.jobs.backend,
    companyId: ids.companies.northstar,
    resume: "https://files.careerconnect.example/resumes/jordan-lee.pdf",
    coverLetter: "My API and database projects have prepared me for this internship.",
    status: "Shortlisted",
    appliedAt: new Date("2026-10-16T10:30:00.000Z"),
    updatedAt: new Date("2026-10-20T12:00:00.000Z")
  },
  {
    _id: ids.applications.morgan,
    studentId: ids.users.studentMorgan,
    jobId: ids.jobs.analyst,
    companyId: ids.companies.greenfield,
    resume: "https://files.careerconnect.example/resumes/morgan-patel.pdf",
    coverLetter: "I would enjoy turning energy data into useful insights.",
    status: "Applied",
    appliedAt: new Date("2026-10-18T08:15:00.000Z"),
    updatedAt: new Date("2026-10-18T08:15:00.000Z")
  }
];

const sampleSavedJobs = [
  {
    _id: ids.savedjobs.avery,
    studentId: ids.users.studentAvery,
    jobId: ids.jobs.backend,
    savedAt: new Date("2026-10-12T11:00:00.000Z")
  },
  {
    _id: ids.savedjobs.jordan,
    studentId: ids.users.studentJordan,
    jobId: ids.jobs.support,
    savedAt: new Date("2026-10-14T14:00:00.000Z")
  }
];

const sampleNotifications = [
  {
    _id: ids.notifications.application,
    userId: ids.users.studentAvery,
    title: "Application received",
    message: "Your application for Frontend Engineering Intern was received.",
    type: "Application",
    isRead: false,
    createdAt: new Date("2026-10-15T09:01:00.000Z")
  },
  {
    _id: ids.notifications.job,
    userId: ids.users.studentJordan,
    title: "New opportunity",
    message: "A fictional remote engineering internship is available.",
    type: "Job",
    isRead: false,
    createdAt: new Date("2026-10-16T08:00:00.000Z")
  },
  {
    _id: ids.notifications.welcome,
    userId: ids.users.studentMorgan,
    title: "Welcome to CareerConnect",
    message: "Complete your profile to explore fictional opportunities.",
    type: "System",
    isRead: true,
    createdAt: new Date("2026-10-10T07:30:00.000Z")
  }
];

const sampleInterviews = [
  {
    _id: ids.interview,
    applicationId: ids.applications.jordan,
    studentId: ids.users.studentJordan,
    companyId: ids.companies.northstar,
    scheduledAt: new Date("2027-01-15T10:00:00.000Z"),
    meetingLink: "https://meet.example.com/northstar-jordan",
    notes: "Fictional first-round conversation.",
    status: "Scheduled"
  }
];

const seedBatches = [
  { collection: "users", docs: sampleUsers, uniqueKeys: [["email"]] },
  { collection: "studentprofiles", docs: sampleStudentProfiles, uniqueKeys: [["userId"]] },
  { collection: "companies", docs: sampleCompanies, uniqueKeys: [["userId"]] },
  { collection: "jobs", docs: sampleJobs, uniqueKeys: [] },
  {
    collection: "applications",
    docs: sampleApplications,
    uniqueKeys: [["studentId", "jobId"]]
  },
  {
    collection: "savedjobs",
    docs: sampleSavedJobs,
    uniqueKeys: [["studentId", "jobId"]]
  },
  { collection: "notifications", docs: sampleNotifications, uniqueKeys: [] },
  { collection: "interviews", docs: sampleInterviews, uniqueKeys: [] }
];

// Check every natural unique key before any sample inserts begin.
for (const batch of seedBatches) {
  const collection = db.getCollection(batch.collection);
  for (const document of batch.docs) {
    for (const keyFields of batch.uniqueKeys) {
      const filter = {};
      for (const field of keyFields) {
        filter[field] = document[field];
      }
      const conflict = collection.findOne(filter, { _id: 1 });
      if (conflict && String(conflict._id) !== String(document._id)) {
        throw new Error(
          `Sample-data conflict in ${batch.collection} for ${keyFields.join(", ")}. ` +
          "No sample inserts have started; resolve the conflict or choose new sample IDs."
        );
      }
    }
  }
}

// Insert only documents whose deterministic _id is not already present.
for (const batch of seedBatches) {
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

// Verify the database, all collection counts, indexes, sample records, and ObjectId references.
console.log(`Verified database name: ${db.getName()}`);
console.log(`Collections: ${JSON.stringify(db.getCollectionNames().sort())}`);

const documentCounts = {};
for (const collectionName of Object.keys(validators)) {
  documentCounts[collectionName] = db.getCollection(collectionName).countDocuments({});
}
console.log(`Document counts: ${JSON.stringify(documentCounts, null, 2)}`);

const indexReport = {};
for (const [collectionName, specs] of Object.entries(indexSpecs)) {
  const indexes = db.getCollection(collectionName).getIndexes();
  indexReport[collectionName] = specs.map((spec) => {
    const match = indexes.find((index) => sameIndexKeys(index.key, spec.key));
    return {
      key: spec.key,
      present: Boolean(match),
      unique: Boolean(match && match.unique)
    };
  });
}
console.log(`Requested indexes: ${JSON.stringify(indexReport, null, 2)}`);

console.log("Sample users (passwords intentionally excluded):");
console.log(JSON.stringify(
  db.users.find(
    { _id: { $in: sampleUsers.map((document) => document._id) } },
    { _id: 1, name: 1, email: 1, role: 1 }
  ).toArray(),
  null,
  2
));
console.log("Sample jobs:");
console.log(JSON.stringify(
  db.jobs.find(
    { _id: { $in: sampleJobs.map((document) => document._id) } },
    { _id: 1, companyId: 1, title: 1, status: 1, location: 1 }
  ).toArray(),
  null,
  2
));

function verifyReference(sourceCollection, sourceId, field, targetCollection) {
  const document = db.getCollection(sourceCollection).findOne({ _id: sourceId }, { [field]: 1 });
  if (!document || !document[field] || document[field]._bsontype !== "ObjectId") {
    throw new Error(`Missing or non-ObjectId reference: ${sourceCollection}.${field}`);
  }
  if (!db.getCollection(targetCollection).findOne({ _id: document[field] }, { _id: 1 })) {
    throw new Error(`Dangling reference: ${sourceCollection}.${field} -> ${targetCollection}`);
  }
  return true;
}

const referenceChecks = [
  ...sampleStudentProfiles.map((document) =>
    ["studentprofiles", document._id, "userId", "users"]),
  ...sampleCompanies.map((document) =>
    ["companies", document._id, "userId", "users"]),
  ...sampleJobs.map((document) =>
    ["jobs", document._id, "companyId", "companies"]),
  ...sampleApplications.flatMap((document) => [
    ["applications", document._id, "studentId", "users"],
    ["applications", document._id, "jobId", "jobs"],
    ["applications", document._id, "companyId", "companies"]
  ]),
  ...sampleSavedJobs.flatMap((document) => [
    ["savedjobs", document._id, "studentId", "users"],
    ["savedjobs", document._id, "jobId", "jobs"]
  ]),
  ...sampleNotifications.map((document) =>
    ["notifications", document._id, "userId", "users"]),
  ...sampleInterviews.flatMap((document) => [
    ["interviews", document._id, "applicationId", "applications"],
    ["interviews", document._id, "studentId", "users"],
    ["interviews", document._id, "companyId", "companies"]
  ])
];

const validReferences = referenceChecks.filter((check) =>
  verifyReference(check[0], check[1], check[2], check[3])
).length;
console.log(`Sample ObjectId references: ${validReferences}/${referenceChecks.length} valid.`);

const uniqueIndexChecks = [
  ["users", { email: 1 }],
  ["studentprofiles", { userId: 1 }],
  ["companies", { userId: 1 }],
  ["applications", { studentId: 1, jobId: 1 }],
  ["savedjobs", { studentId: 1, jobId: 1 }]
].map(([collectionName, key]) => {
  const index = db.getCollection(collectionName)
    .getIndexes()
    .find((candidate) => sameIndexKeys(candidate.key, key));
  return { collection: collectionName, key, unique: Boolean(index && index.unique) };
});

console.log(`Duplicate-prevention indexes: ${JSON.stringify(uniqueIndexChecks, null, 2)}`);
if (uniqueIndexChecks.some((check) => !check.unique)) {
  throw new Error("One or more required unique indexes are missing.");
}
console.log("CareerConnect Playground setup and verification complete.");
