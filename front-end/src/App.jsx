import './App.css';
import { Link } from 'react-router-dom';
import { useUserAuth } from './context/UserAuthContext';
import Footer from './components/footer.jsx';
import Navhome from './components/navhome.jsx';

function App() {
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
            <a href="#" className="btn primary large">Get Start!</a>
            <a href="#" className="btn ghost large">Explore features</a>
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
              <p>Get sample letters, up-to-date requirements, and country-by-country rules in one connected place.</p>
              <span className="card-edge"></span>
            </article>

            <article className="feature-card">
              <div className="icon"><i className="fa-solid fa-bullseye"></i></div>
              <h3>Budget-Based<br />Recommendations</h3>
              <p>Filter by your budget tier and discover matching destinations and stays—no guesswork.</p>
              <span className="card-edge"></span>
            </article>

            <article className="feature-card">
              <div className="icon"><i className="fa-solid fa-list-check"></i></div>
              <h3>Ready-to-Go<br />List</h3>
              <p>Quick start checklists and mini itineraries so you can leave in hours, not weeks.</p>
              <span className="card-edge"></span>
            </article>
          </div>
        </div>
      </section>

      

      {/* Content blocks (alternate left/right, similar structure as before) */}
      <section className="section alt">
        <div className="container split">
          <div className="text">
            <h3><a href="#" className="link-accent">All-in-One</a> Visa Information</h3>
            <p>
              Get sample letters, rules by nationality, and step-by-step requirements you can skim.
              Our visa center brings clarity to any destination plan—quickly compare and prepare with confidence.
            </p>
          </div>
          <div className="images">
            <img className="stack top" src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop" alt="visa docs" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split reverse">
          <div className="images single">
            <img src="https://images.unsplash.com/photo-1485988412941-77a35537dae4?q=80&w=1600&auto=format&fit=crop" alt="wing" />
          </div>
          <div className="text">
            <h3><a href="#" className="link-accent">Budget-Based</a> <span className="nowrap">Recommendations</span></h3>
            <p>
              Decide cost tiers and deals-first lists that match your budget range. Set a daily spend, pick the mood,
              and let our engine suggest trip ideas with ease and real prices.
            </p>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container split">
          <div className="text">
            <h3><a href="#" className="link-accent">Ready-to-Go</a> List</h3>
            <p>
              Fast launch. Travel staples, short plans, &amp; quick saves that minimize prep time for
              solo or family trips.
            </p>
          </div>
          <div className="images">
            <img className="stack top" src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop" alt="coastline" />
          </div>
        </div>
      </section>

      <Footer/>
    </>
  )
}

export default App