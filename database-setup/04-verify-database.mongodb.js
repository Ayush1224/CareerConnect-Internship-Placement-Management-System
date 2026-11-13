/* global use, db, ObjectId, console */
use("careerconnect");

if (db.getName() !== "careerconnect") {
  throw new Error(`Wrong database selected: ${db.getName()}`);
}

const validators = {
  users: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password"],
      properties: {
        name: { bsonType: "string" }, email: { bsonType: "string" },
        password: { bsonType: "string" }, phone: { bsonType: "string" },
        role: { bsonType: "string", enum: ["student", "company", "admin"] },
        isActive: { bsonType: "bool" }, createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  studentprofiles: {
    $jsonSchema: {
      bsonType: "object", required: ["userId"],
      properties: {
        userId: { bsonType: "objectId" }, profileImage: { bsonType: "string" },
        college: { bsonType: "string" }, degree: { bsonType: "string" },
        branch: { bsonType: "string" },
        graduationYear: { bsonType: ["double", "int", "long", "decimal"] },
        skills: { bsonType: "array", items: { bsonType: "string" } },
        resume: { bsonType: "string" }, github: { bsonType: "string" },
        linkedin: { bsonType: "string" }, portfolio: { bsonType: "string" },
        bio: { bsonType: "string" }, location: { bsonType: "string" }
      }
    }
  },
  companies: {
    $jsonSchema: {
      bsonType: "object", required: ["userId", "companyName"],
      properties: {
        userId: { bsonType: "objectId" }, companyName: { bsonType: "string" },
        logo: { bsonType: "string" }, website: { bsonType: "string" },
        industry: { bsonType: "string" }, location: { bsonType: "string" },
        description: { bsonType: "string" }, contactEmail: { bsonType: "string" },
        verified: { bsonType: "bool" }
      }
    }
  },
  jobs: {
    $jsonSchema: {
      bsonType: "object", required: ["companyId", "title", "description"],
      properties: {
        companyId: { bsonType: "objectId" }, title: { bsonType: "string" },
        description: { bsonType: "string" }, requirements: { bsonType: "string" },
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
      bsonType: "object", required: ["studentId", "jobId", "companyId"],
      properties: {
        studentId: { bsonType: "objectId" }, jobId: { bsonType: "objectId" },
        companyId: { bsonType: "objectId" }, resume: { bsonType: "string" },
        coverLetter: { bsonType: "string" },
        status: { bsonType: "string", enum: ["Applied", "Shortlisted", "Rejected", "Selected"] },
        appliedAt: { bsonType: "date" }, updatedAt: { bsonType: "date" }
      }
    }
  },
  savedjobs: {
    $jsonSchema: {
      bsonType: "object", required: ["studentId", "jobId"],
      properties: {
        studentId: { bsonType: "objectId" }, jobId: { bsonType: "objectId" },
        savedAt: { bsonType: "date" }
      }
    }
  },
  notifications: {
    $jsonSchema: {
      bsonType: "object", required: ["userId"],
      properties: {
        userId: { bsonType: "objectId" }, title: { bsonType: "string" },
        message: { bsonType: "string" },
        type: { bsonType: "string", enum: ["Application", "Job", "Interview", "System"] },
        isRead: { bsonType: "bool" }, createdAt: { bsonType: "date" }
      }
    }
  },
  interviews: {
    $jsonSchema: {
      bsonType: "object", required: ["applicationId", "studentId", "companyId"],
      properties: {
        applicationId: { bsonType: "objectId" }, studentId: { bsonType: "objectId" },
        companyId: { bsonType: "objectId" }, scheduledAt: { bsonType: "date" },
        meetingLink: { bsonType: "string" }, notes: { bsonType: "string" },
        status: { bsonType: "string", enum: ["Scheduled", "Completed", "Cancelled"] }
      }
    }
  }
};

const indexSpecs = {
  users: [{ key: { email: 1 }, unique: true }],
  studentprofiles: [{ key: { userId: 1 }, unique: true }],
  companies: [{ key: { userId: 1 }, unique: true }],
  jobs: [
    { key: { companyId: 1 } },
    { key: { status: 1, location: 1 } },
    { key: { title: "text", description: "text", skillsRequired: "text" } },
    { key: { status: 1 } },
    { key: { location: 1 } },
    { key: { companyId: 1, status: 1 } }
  ],
  applications: [
    { key: { studentId: 1, jobId: 1 }, unique: true },
    { key: { jobId: 1 } },
    { key: { companyId: 1 } }
  ],
  savedjobs: [{ key: { studentId: 1, jobId: 1 }, unique: true }],
  notifications: [{ key: { userId: 1, isRead: 1 } }, { key: { userId: 1 } }],
  interviews: [{ key: { applicationId: 1 } }, { key: { scheduledAt: 1 } }]
};

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    const result = {};
    for (const key of Object.keys(value).sort()) result[key] = canonical(value[key]);
    return result;
  }
  return value;
}

function sameIndexKeys(actual, expected) {
  const actualEntries = Object.entries(actual);
  const expectedEntries = Object.entries(expected);
  return actualEntries.length === expectedEntries.length &&
    actualEntries.every(([field, value], index) =>
      field === expectedEntries[index][0] && value === expectedEntries[index][1]);
}

const expectedCollections = Object.keys(validators).sort();
const infos = db.getCollectionInfos();
const byName = new Map(infos.map((info) => [info.name, info]));
const missing = expectedCollections.filter((name) => !byName.has(name));
if (missing.length > 0) {
  throw new Error(`Missing collections: ${missing.join(", ")}`);
}

const counts = {};
const validatorReport = {};
const indexReport = {};
for (const name of expectedCollections) {
  const info = byName.get(name);
  const actualValidator = info.options && info.options.validator;
  validatorReport[name] = Boolean(actualValidator) &&
    JSON.stringify(canonical(actualValidator)) === JSON.stringify(canonical(validators[name])) &&
    info.options.validationLevel === "moderate" &&
    info.options.validationAction === "error";
  if (!validatorReport[name]) {
    console.log(`Validator mismatch or absent on ${name}; existing settings were not changed.`);
  }

  const collection = db.getCollection(name);
  counts[name] = collection.countDocuments({});
  const actualIndexes = collection.getIndexes();
  indexReport[name] = indexSpecs[name].map((spec) => {
    const match = actualIndexes.find((index) => sameIndexKeys(index.key, spec.key));
    const coversAllDocuments = Boolean(match && !match.sparse && !match.partialFilterExpression);
    return {
      key: spec.key,
      present: coversAllDocuments,
      unique: spec.unique ? Boolean(match && match.unique && coversAllDocuments) : undefined
    };
  });
}

const sampleIds = {
  users: [
    ObjectId("650000000000000000000001"), ObjectId("650000000000000000000002"),
    ObjectId("650000000000000000000003"), ObjectId("650000000000000000000004"),
    ObjectId("650000000000000000000005"), ObjectId("650000000000000000000006")
  ],
  studentprofiles: [
    ObjectId("650000000000000000000101"), ObjectId("650000000000000000000102"),
    ObjectId("650000000000000000000103")
  ],
  companies: [ObjectId("650000000000000000000201"), ObjectId("650000000000000000000202")],
  jobs: [
    ObjectId("650000000000000000000301"), ObjectId("650000000000000000000302"),
    ObjectId("650000000000000000000303"), ObjectId("650000000000000000000304"),
    ObjectId("650000000000000000000305")
  ],
  applications: [
    ObjectId("650000000000000000000401"), ObjectId("650000000000000000000402"),
    ObjectId("650000000000000000000403")
  ],
  savedjobs: [ObjectId("650000000000000000000501"), ObjectId("650000000000000000000502")],
  notifications: [
    ObjectId("650000000000000000000601"), ObjectId("650000000000000000000602"),
    ObjectId("650000000000000000000603")
  ],
  interviews: [ObjectId("650000000000000000000701")]
};
for (const [name, ids] of Object.entries(sampleIds)) {
  const found = db.getCollection(name).countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) {
    throw new Error(`Expected ${ids.length} sample records in ${name}; found ${found}.`);
  }
}

const refs = [
  ["studentprofiles", "650000000000000000000101", "userId", "users", "650000000000000000000002"],
  ["studentprofiles", "650000000000000000000102", "userId", "users", "650000000000000000000003"],
  ["studentprofiles", "650000000000000000000103", "userId", "users", "650000000000000000000004"],
  ["companies", "650000000000000000000201", "userId", "users", "650000000000000000000005"],
  ["companies", "650000000000000000000202", "userId", "users", "650000000000000000000006"],
  ["jobs", "650000000000000000000301", "companyId", "companies", "650000000000000000000201"],
  ["jobs", "650000000000000000000302", "companyId", "companies", "650000000000000000000201"],
  ["jobs", "650000000000000000000303", "companyId", "companies", "650000000000000000000201"],
  ["jobs", "650000000000000000000304", "companyId", "companies", "650000000000000000000202"],
  ["jobs", "650000000000000000000305", "companyId", "companies", "650000000000000000000202"],
  ["applications", "650000000000000000000401", "studentId", "users", "650000000000000000000002"],
  ["applications", "650000000000000000000401", "jobId", "jobs", "650000000000000000000301"],
  ["applications", "650000000000000000000401", "companyId", "companies", "650000000000000000000201"],
  ["applications", "650000000000000000000402", "studentId", "users", "650000000000000000000003"],
  ["applications", "650000000000000000000402", "jobId", "jobs", "650000000000000000000302"],
  ["applications", "650000000000000000000402", "companyId", "companies", "650000000000000000000201"],
  ["applications", "650000000000000000000403", "studentId", "users", "650000000000000000000004"],
  ["applications", "650000000000000000000403", "jobId", "jobs", "650000000000000000000304"],
  ["applications", "650000000000000000000403", "companyId", "companies", "650000000000000000000202"],
  ["savedjobs", "650000000000000000000501", "studentId", "users", "650000000000000000000002"],
  ["savedjobs", "650000000000000000000501", "jobId", "jobs", "650000000000000000000302"],
  ["savedjobs", "650000000000000000000502", "studentId", "users", "650000000000000000000003"],
  ["savedjobs", "650000000000000000000502", "jobId", "jobs", "650000000000000000000305"],
  ["notifications", "650000000000000000000601", "userId", "users", "650000000000000000000002"],
  ["notifications", "650000000000000000000602", "userId", "users", "650000000000000000000003"],
  ["notifications", "650000000000000000000603", "userId", "users", "650000000000000000000004"],
  ["interviews", "650000000000000000000701", "applicationId", "applications", "650000000000000000000402"],
  ["interviews", "650000000000000000000701", "studentId", "users", "650000000000000000000003"],
  ["interviews", "650000000000000000000701", "companyId", "companies", "650000000000000000000201"]
];
let validReferences = 0;
for (const [source, sourceId, field, target, targetId] of refs) {
  const sourceDoc = db.getCollection(source).findOne({ _id: ObjectId(sourceId) }, { [field]: 1 });
  if (!sourceDoc || !sourceDoc[field] ||
      sourceDoc[field]._bsontype !== "ObjectId" ||
      String(sourceDoc[field]) !== targetId ||
      !db.getCollection(target).findOne({ _id: ObjectId(targetId) }, { _id: 1 })) {
    throw new Error(`Invalid sample reference: ${source}.${field} -> ${target}`);
  }
  validReferences += 1;
}

console.log(`Database: ${db.getName()}`);
console.log(`Collections: ${expectedCollections.join(", ")}`);
console.log(`Document counts: ${JSON.stringify(counts, null, 2)}`);
console.log(`Validators match expected schemas: ${JSON.stringify(validatorReport, null, 2)}`);
console.log(`Required indexes: ${JSON.stringify(indexReport, null, 2)}`);
console.log(`Sample ObjectId references verified: ${validReferences}/${refs.length}`);

const invalidValidators = Object.keys(validatorReport).filter((name) => !validatorReport[name]);
const invalidIndexes = Object.entries(indexReport).flatMap(([name, indexes]) =>
  indexes.filter((index) => !index.present || (index.unique === false))
    .map((index) => `${name} ${JSON.stringify(index.key)}`));
if (invalidValidators.length > 0 || invalidIndexes.length > 0) {
  throw new Error(
    `Verification failed. Validators: ${invalidValidators.join(", ") || "OK"}; ` +
    `indexes: ${invalidIndexes.join(", ") || "OK"}.`
  );
}

console.log("Read-only verification complete.");
