const CompanyCard = ({ company }) => (
  <div className="company-card">
    <div className="company-card__logo">{company.logo}</div>
    <h3>{company.name}</h3>
    <p>{company.industry}</p>
    <span>{company.location}</span>
  </div>
);

export default CompanyCard;
