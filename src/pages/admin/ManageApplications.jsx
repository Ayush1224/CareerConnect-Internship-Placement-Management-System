import { applications } from '../../data/mockData';

const ManageApplications = () => (
  <div className="dashboard-page">
    <div className="page-header">
      <div>
        <span className="eyebrow">Applications</span>
        <h1>All applications</h1>
      </div>
    </div>
    <div className="panel-card padded">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Company</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>{application.studentId}</td>
              <td>{application.company}</td>
              <td>{application.jobTitle}</td>
              <td>{application.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ManageApplications;
