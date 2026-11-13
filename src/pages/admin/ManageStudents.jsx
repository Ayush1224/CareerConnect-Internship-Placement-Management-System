import { studentProfiles } from '../../data/mockData';

const ManageStudents = () => (
  <div className="dashboard-page">
    <div className="page-header">
      <div>
        <span className="eyebrow">Students</span>
        <h1>Manage students</h1>
      </div>
    </div>
    <div className="panel-card padded">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>College</th>
            <th>Skills</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {studentProfiles.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.college}</td>
              <td>{student.skills.slice(0, 2).join(', ')}</td>
              <td>{student.status}</td>
              <td><button type="button" className="table-link">View</button> <button type="button" className="table-link table-link--danger">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ManageStudents;
