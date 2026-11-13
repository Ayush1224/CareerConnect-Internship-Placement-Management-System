# Job applications

Students can submit one application per job while the job is `Active` and its
application deadline is later than the current time. A date-only deadline is
stored as the end of that UTC day, and the same availability rule is used by
job browsing and application submission. The application stores the resume
from the student's profile, if present; cover letters are optional.

The server derives the student from the authenticated account and the company
from the job. The unique `studentId` + `jobId` database index is the final
duplicate-submission guard; duplicate requests return HTTP 409.

Applications start as `Applied`. Companies may change status to any value in
the Application model enum: `Applied`, `Shortlisted`, `Rejected`, or `Selected`.
There is no separate transition graph in the existing application behavior;
valid enum values may be selected in any order. Applicant reads and status
updates are limited to the company that owns the job, including after a job is
closed. Closing a job does not delete applications.
