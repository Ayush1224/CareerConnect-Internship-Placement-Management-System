/* global use, db, console */
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

const existingNames = new Set(db.getCollectionInfos().map((info) => info.name));
for (const [name, validator] of Object.entries(validators)) {
  if (existingNames.has(name)) {
    console.log(`Preserved existing collection; its validator was not changed: ${name}`);
    continue;
  }

  db.createCollection(name, {
    validator,
    validationLevel: "moderate",
    validationAction: "error"
  });
  console.log(`Created collection with validator: ${name}`);
}

console.log(`Collection phase complete for ${db.getName()}.`);
