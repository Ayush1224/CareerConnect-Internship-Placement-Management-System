import { CheckCircle, Goal, Lightbulb, Users } from 'lucide-react';

const About = () => (
  <section className="page-shell">
    <div className="container narrow">
      <span className="eyebrow">About us</span>
      <h1>Shaping the next generation of careers.</h1>
      <p className="lead">CareerConnect is a placement and internship platform designed to blur the gap between education and opportunity. We help students discover meaningful career paths and help companies discover promising talent they can trust.</p>

      <div className="feature-grid feature-grid--three">
        <div className="feature-card"><Goal size={28} /><h3>Mission</h3><p>Empower students with access to internships, jobs and opportunities that align with their ambitions.</p></div>
        <div className="feature-card"><Lightbulb size={28} /><h3>Vision</h3><p>Build an ecosystem where every student has a fair chance to learn, grow and succeed.</p></div>
        <div className="feature-card"><Users size={28} /><h3>Community</h3><p>Connect learners, recruiters and educators through a transparent and proactive hiring platform.</p></div>
      </div>

      <div className="two-column">
        <div>
          <h2>Why students choose CareerConnect</h2>
          <ul className="check-list">
            <li><CheckCircle size={16} /> Personalized job recommendations</li>
            <li><CheckCircle size={16} /> Resume and profile visibility</li>
            <li><CheckCircle size={16} /> Transparent application tracking</li>
            <li><CheckCircle size={16} /> Mobile-friendly platform experience</li>
          </ul>
        </div>
        <div>
          <h2>How the platform works</h2>
          <ol className="numbered-list">
            <li>Create an account and complete your profile.</li>
            <li>Explore curated roles based on your skills and preferences.</li>
            <li>Apply, accept offers and track progress in one dashboard.</li>
          </ol>
        </div>
      </div>
    </div>
  </section>
);

export default About;
