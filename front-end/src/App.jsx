import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// import { Link } from 'react-router-dom'
import Footer from './components/footer.jsx'
import Navhome from './components/navhome.jsx'

function App() {
 

  return (
    <>
      <Navhome/>
      
      <section className="hero">
        <div className="overlay"></div>
        <div className="container hero-inner">
          <h1>Got <span className="accent">plans</span> for the upcoming holiday?</h1>
          <p className="lead">
            We help you compare, stay up to date on visa rules, and match best-suited destination picks.
            Travel smarter, travel confidently with us by your side.
          </p>
          <div className="cta-row">
            <a href="#" className="btn primary large">Get Start!</a>
            <a href="#" className="btn ghost large">Explore features</a>
          </div>
        </div>
      </section>

      <section className="section features">
        <div className="container">
          <h2 className="section-title">We have Features</h2>
          <div className="feature-grid">
            <article className="feature-card">
              <div className="icon"><i className="fa-regular fa-file-lines"></i></div>
              <h3>All-in-One<br/>Visa Information</h3>
              <p>Get sample letters, up-to-date requirements, and country-by-country rules in one connected place.</p>
              <span className="card-edge"></span>
            </article>

            <article className="feature-card">
              <div className="icon"><i className="fa-solid fa-bullseye"></i></div>
              <h3>Budget-Based<br/>Recommendations</h3>
              <p>Filter by your budget tier and discover matching destinations and stays—no guesswork.</p>
              <span className="card-edge"></span>
            </article>

            <article className="feature-card">
              <div className="icon"><i className="fa-solid fa-list-check"></i></div>
              <h3>Ready-to-Go<br/>List</h3>
              <p>Quick start checklists and mini itineraries so you can leave in hours, not weeks.</p>
              <span className="card-edge"></span>
            </article>
          </div>
        </div>
      </section>

      {/* <h1>Welcome page</h1>
      <img src={reactLogo} alt="React Logo" />
      <br />
      <br /> */}
      
      {/* <Link to="/login" className='btn btn-success'>Login</Link>
      <Link to="/register" className='btn btn-primary'>Register</Link> */}
      
      <Footer/>
    </>
  )
}

export default App