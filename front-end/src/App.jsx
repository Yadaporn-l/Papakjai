import './App.css';
import { Link } from 'react-router-dom';
import { useUserAuth } from './context/UserAuthContext';
import Footer from './components/footer.jsx';
import Navhome from './components/navhome.jsx';

function App() {
  // ✅ Actually use the hook to get the user
  const { user } = useUserAuth();

  return (
    <>
      <Navhome />

      {/* Optional: email verification banner */}
      {user && user.email && !user.emailVerified && (
        <div className="alert alert-warning text-center m-0">
          Please verify your email ({user.email}) to unlock all features.
        </div>
      )}

      <section className="hero">
        <div className="overlay"></div>
        <div className="container hero-inner">
          <h1>Got <span className="accent">plans</span> for the upcoming holiday?</h1>
          <p className="lead">
            We help you compare, stay up-to-date on visa rules, and match best-suited destination picks.
            Travel smarter, travel confidently with us by your side.
          </p>
          <div className="cta-row">
            <Link
              to="/register"
              className="btn primary large"
            >
              Get Started
            </Link>
            <Link to="/visainfo" className="btn ghost large">
              Explore features
            </Link>
          </div>
        </div>
      </section>

      {/* Feature icons row */}
      <section className="section features">
        <div className="container">
          <h2 className="section-title">We have Features</h2>
          <div className="feature-grid">
            <article className="feature-card">
              <div className="icon"><i className="fa-regular fa-file-lines"></i></div>
              <h3>All-in-One<br />Visa Information</h3>
              <p className="text-grey">Clear, quick, and complete visa prep—rules, samples, and guides for every country.</p>
              <span className="card-edge"></span>
            </article>

            <article className="feature-card">
              <div className="icon"><i className="fa-solid fa-bullseye"></i></div>
              <h3>Immersive<br />Travel Features</h3>
              <p className="text-grey">Discover top places through inspiring travel stories and visuals from around the world.</p>
              <span className="card-edge"></span>
            </article>

            <article className="feature-card">
              <div className="icon"><i className="fa-solid fa-list-check"></i></div>
              <h3>Global<br />Travel Prep Hub</h3>
              <p className="text-grey">Get ready to go— visa tips, travel essentials, and quick guides for every journey.</p>
              <span className="card-edge"></span>
            </article>
          </div>
        </div>
      </section>

      {/* Content blocks (alternate left/right, similar structure as before) */}
      <section className="section alt">
        <div className="container split">
          <div className="text">
            <h3><Link to="/visainfo" className="link-accent">All-in-One</Link> Visa Information</h3>
            <p>
              Get sample letters, rules by nationality, and step-by-step requirements you can skim.
              Our visa center brings clarity to any destination plan—quickly compare and prepare with confidence.
            </p>
          </div>
          <div className="images">
            <img
              className="stack top"
              src="https://images.pexels.com/photos/7235894/pexels-photo-7235894.jpeg?_gl=1*qpp83o*_ga*MjExNzEwMTA1Ny4xNzU0MjE4NzEw*_ga_8JE65Q40S6*czE3NjE0NDI3NTYkbzYkZzEkdDE3NjE0NDI4MDYkajEwJGwwJGgw"
              alt="visa docs"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split reverse">
          <div className="images single">
            <img
              src="https://images.unsplash.com/photo-1485988412941-77a35537dae4?q=80&w=1600&auto=format&fit=crop"
              alt="wing"
              loading="lazy"
            />
          </div>
          <div className="text">
            <h3><span className="link-accent">Explore with</span> <span className="nowrap">Video Inspiration</span></h3>
            <p>
             Discover your next dream destination through curated travel clips from around the world. Watch real experiences, explore hidden gems, and get inspired to plan your journey with visuals that speak louder than words.
            </p>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container split">
          <div className="text">
            <h3><span className="link-accent">Global</span> Travel Prep Hub</h3>
            <p>
              From visa checklists to must-have travel tips, our prep center gathers everything you need before flying abroad. Understand document requirements, travel rules, and packing guides—so you can take off with confidence.

            </p>
          </div>
          <div className="images">
            <img
              className="stack top"
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop"
              alt="coastline"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default App;