import { ArrowRight, BriefcaseBusiness, Building2, Search, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ctaStats, jobs, platformTestimonials, companyProfiles } from '../../data/mockData';
import JobCard from '../../components/cards/JobCard';
import CompanyCard from '../../components/cards/CompanyCard';
import Button from '../../components/common/Button';

const Home = () => (
  <div>
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Career growth starts here</span>
          <h1>Build Your Career. Discover Your Future.</h1>
          <p>Access the best internship and job opportunities, connect with leading companies, and grow with a platform designed for ambitious talent.</p>
          <div className="hero-search">
            <Search size={18} />
            <input type="text" placeholder="Search jobs, internships, companies" />
          </div>
          <div className="cta-row">
            <Link to="/jobs" className="btn btn--primary">Browse Jobs</Link>
            <Link to="/register" className="btn btn--secondary">Get Started</Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-panel__card">
            <p className="label">Featured roles</p>
            <h3>Product Designer</h3>
            <div className="meta-stack">
              <span><BriefcaseBusiness size={14} /> Remote</span>
              <span><Building2 size={14} /> Amazon</span>
            </div>
            <div className="mini-stat-row">
              <div><strong>12k+</strong><small>Applicants</small></div>
              <div><strong>5</strong><small>Open roles</small></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="section section--soft">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Featured roles</span>
            <h2>Fresh opportunities for you</h2>
          </div>
          <Link to="/jobs" className="text-link">View all jobs <ArrowRight size={16} /></Link>
        </div>
        <div className="card-grid card-grid--jobs">
          {jobs.slice(0, 3).map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">Trusted by students and companies</span>
          <h2>Top hiring partners</h2>
        </div>
        <div className="company-grid">
          {companyProfiles.map((company) => <CompanyCard key={company.id} company={company} />)}
        </div>
      </div>
    </section>

    <section className="section section--soft">
      <div className="container">
        <div className="stats-row">
          {ctaStats.map((stat) => (
            <div key={stat.label} className="stat-box">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">How it works</span>
          <h2>Your career journey in 3 simple steps</h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create your profile</h3>
            <p>Showcase your experience, skills, achievements and resume in one place.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Discover matching roles</h3>
            <p>Browse curated internships and jobs tailored for your background and interests.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Get hired faster</h3>
            <p>Track applications, interviews and shortlists with a simple workflow.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="section section--soft">
      <div className="container">
        <div className="section-head center">
          <span className="eyebrow">Student success stories</span>
          <h2>Leaders built through CareerConnect</h2>
        </div>
        <div className="testimonial-grid">
          {platformTestimonials.map((item) => (
            <div key={item.name} className="testimonial-card">
              <div className="stars"><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p>“{item.quote}”</p>
              <div className="testimonial-author">
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section cta-banner">
      <div className="container cta-banner__inner">
        <div>
          <span className="eyebrow">Ready for your next opportunity?</span>
          <h2>Let your career move forward.</h2>
        </div>
        <Button>Join now</Button>
      </div>
    </section>
  </div>
);

export default Home;
