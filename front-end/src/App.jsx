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
            We help you compare, stay up-to-date on visa rules, and match best-suited destination picks.
            Travel smarter, travel confidently with us by your side.
          </p>
          <div className="cta-row">
            <a href="#" className="btn primary large">Get Start!</a>
            <a href="#" className="btn ghost large">Explore features</a>
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
            <img className="stack top" src="https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200&auto=format&fit=crop" alt="visa docs" />
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