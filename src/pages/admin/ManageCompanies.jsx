import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import {
  getAdminCompanies,
  setCompanyVerification
} from '../../services/adminService';

const PAGE_SIZE = 10;

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [verificationFilter, setVerificationFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingCompanyId, setSavingCompanyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchCompanies = async () => {
      try {
        const response = await getAdminCompanies({
          page,
          limit: PAGE_SIZE,
          verified: verificationFilter
        });
        if (active) {
          setCompanies(response.data.companies);
          setPagination(response.data.pagination);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load companies.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchCompanies();
    return () => {
      active = false;
    };
  }, [page, verificationFilter, reloadKey]);

  const handleVerification = async (company) => {
    const verified = !company.verified;
    if (!verified && !window.confirm(`Revoke verification for ${company.companyName}?`)) return;

    setIsLoading(true);
    setSavingCompanyId(company._id);
    setError('');
    setMessage('');
    try {
      const response = await setCompanyVerification(company._id, verified);
      setMessage(response.message);
      setIsLoading(true);
      setReloadKey((currentKey) => currentKey + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update company verification.');
    } finally {
      setSavingCompanyId('');
    }
  };

  const handleFilterChange = (event) => {
    setIsLoading(true);
    setError('');
    setVerificationFilter(event.target.value);
    setPage(1);
    setMessage('');
  };

  const handlePageChange = (nextPage) => {
    setIsLoading(true);
    setError('');
    setPage(nextPage);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError('');
    setReloadKey((currentKey) => currentKey + 1);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Companies</span>
          <h1>Manage companies</h1>
        </div>
        <label>
          Verification status{' '}
          <select
            className="search-input"
            value={verificationFilter}
            onChange={handleFilterChange}
          >
            <option value="">All companies</option>
            <option value="verified">Verified</option>
            <option value="unverified">Not verified</option>
          </select>
        </label>
      </div>
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      {message ? <p className="success-message" role="status">{message}</p> : null}
      {isLoading ? <Loader text="Loading companies..." /> : error ? (
        <button type="button" className="btn btn--secondary" onClick={handleRetry}>Try again</button>
      ) : (
        <div className="panel-card padded">
          {companies.length === 0 ? (
            <EmptyState
              title="No companies found"
              description={verificationFilter ? 'No companies match this verification status.' : 'Company profiles will appear here when registered.'}
            />
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company._id}>
                      <td>{company.companyName}</td>
                      <td>{company.industry || '-'}</td>
                      <td>{company.location || '-'}</td>
                      <td>{company.verified ? 'Verified' : 'Not verified'}</td>
                      <td>
                        <button
                          type="button"
                          className={`table-link${company.verified ? ' table-link--danger' : ''}`}
                          onClick={() => handleVerification(company)}
                          disabled={savingCompanyId === company._id}
                        >
                          {savingCompanyId === company._id
                            ? 'Saving...'
                            : company.verified ? 'Revoke verification' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pagination.totalPages > 1 ? (
                <div className="page-header">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} companies)</span>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    disabled={page >= pagination.totalPages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageCompanies;
