/* global use, db, console */
use("careerconnect");

if (db.getName() !== "careerconnect") {
  throw new Error(`Wrong database selected: ${db.getName()}`);
}

const indexSpecs = {
  users: [
    { key: { email: 1 }, options: { name: "email_1", unique: true } }
  ],
  studentprofiles: [
    { key: { userId: 1 }, options: { name: "userId_1", unique: true } }
  ],
  companies: [
    { key: { userId: 1 }, options: { name: "userId_1", unique: true } }
  ],
  jobs: [
    { key: { companyId: 1 }, options: { name: "companyId_1" } },
    { key: { status: 1, location: 1 }, options: { name: "status_1_location_1" } },
    {
      key: { title: "text", description: "text", skillsRequired: "text" },
      options: { name: "job_text_search" }
    },
    { key: { status: 1 }, options: { name: "status_1" } },
    { key: { location: 1 }, options: { name: "location_1" } },
    { key: { companyId: 1, status: 1 }, options: { name: "companyId_1_status_1" } }
  ],
  applications: [
    {
      key: { studentId: 1, jobId: 1 },
      options: { name: "studentId_1_jobId_1", unique: true }
    },
    { key: { jobId: 1 }, options: { name: "jobId_1" } },
    { key: { companyId: 1 }, options: { name: "companyId_1" } }
  ],
  savedjobs: [
    {
      key: { studentId: 1, jobId: 1 },
      options: { name: "studentId_1_jobId_1", unique: true }
    }
  ],
  notifications: [
    { key: { userId: 1, isRead: 1 }, options: { name: "userId_1_isRead_1" } },
    { key: { userId: 1 }, options: { name: "userId_1" } }
  ],
  interviews: [
    { key: { applicationId: 1 }, options: { name: "applicationId_1" } },
    { key: { scheduledAt: 1 }, options: { name: "scheduledAt_1" } }
  ]
};

const collectionNames = new Set(db.getCollectionNames());
const missingCollections = Object.keys(indexSpecs).filter((name) => !collectionNames.has(name));
if (missingCollections.length > 0) {
  throw new Error(`Run phase 01 first; missing collections: ${missingCollections.join(", ")}`);
}

function sameIndexKeys(actual, expected) {
  const actualEntries = Object.entries(actual);
  const expectedEntries = Object.entries(expected);
  return actualEntries.length === expectedEntries.length &&
    actualEntries.every(([field, value], index) =>
      field === expectedEntries[index][0] && value === expectedEntries[index][1]);
}

for (const [collectionName, specs] of Object.entries(indexSpecs)) {
  const collection = db.getCollection(collectionName);
  for (const spec of specs) {
    const match = collection.getIndexes().find((index) => sameIndexKeys(index.key, spec.key));
    if (match) {
      const coversAllDocuments = !match.sparse && !match.partialFilterExpression;
      if (spec.options.unique && (!match.unique || !coversAllDocuments)) {
        throw new Error(
          `Unsafe index conflict on ${collectionName}: ${JSON.stringify(spec.key)}. ` +
          "A full, unique index is required; no existing index was changed."
        );
      }
      if (!coversAllDocuments) {
        throw new Error(
          `Partial or sparse index conflict on ${collectionName}: ${JSON.stringify(spec.key)}. ` +
          "Review it manually; no existing index was changed."
        );
      }
      console.log(`Index already satisfies requirement: ${collectionName} ${JSON.stringify(spec.key)}`);
      continue;
    }

    collection.createIndex(spec.key, spec.options);
    console.log(`Created index: ${collectionName} ${JSON.stringify(spec.key)}`);
  }
}

console.log(`Index phase complete for ${db.getName()}.`);
