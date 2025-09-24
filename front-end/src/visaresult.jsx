import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './visashowinfo.css';

// AccordionItem component
function AccordionItem({ title, fetchData, children }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setOpen(!open);

    // Fetch data only when opening for the first time
    if (!open && fetchData && !content) {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchData();
        setContent(data);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="accordion-item" onClick={handleClick}>
        <span>{title}</span>
        <span>{open ? '−' : '+'}</span>
      </div>
      {open && (
        <div className="accordion-content">
          {loading && <p>Loading...</p>}
          {error && <p style={{color:'red'}}>{error}</p>}
          {content || children}
        </div>
      )}
    </>
  );
}

export default function VisaResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { country, days } = location.state || { country: 'Australia', days: 30 };

  // default data
  const defaultInfo = {
    documents: ["Passport", "Visa application form", "Photo"],
    expenses: "$100/day (default)",
    accommodationTips: "Book in advance, check reviews.",
    otherTips: "Travel insurance recommended.",
  };

  // fetch function for Country Info
  const fetchCountryInfo = async () => {
    const res = await fetch(`https://restcountries.com/v3.1/name/${country}?fullText=true`);
    if (!res.ok) throw new Error(`Country not found: ${res.status}`);
    const data = await res.json();
    const c = data[0];

    return (
      <div>
        <p><strong>Official Name:</strong> {c.name.official}</p>
        <p><strong>Region:</strong> {c.region}</p>
        <p><strong>Subregion:</strong> {c.subregion || 'N/A'}</p>
        <p><strong>Languages:</strong> {c.languages ? Object.values(c.languages).join(', ') : 'N/A'}</p>
        <p><strong>Currency:</strong> {c.currencies ? Object.keys(c.currencies).join(', ') : 'N/A'}</p>
        <p><strong>Timezones:</strong> {c.timezones ? c.timezones.join(', ') : 'N/A'}</p>
        <p><strong>Population:</strong> {c.population.toLocaleString()}</p>
      </div>
    );
  };

  return (
    <div>
      <div className="navbar">
        <a href="#" className="brand">
          <img src="img/pa_pak_jai-removebg.png" alt="logo" />
          <span>PaPak<span className="accent">Jai</span></span>
        </a>
      </div>

      <div className="profile">
        <img src="https://cdn-icons-png.flaticon.com/512/201/201623.png" alt="Traveler" />
        <div className="info">
          <p><strong>Country:</strong> {country} 📍</p>
          <p><strong>Length of stay:</strong> {days} Days</p>
        </div>
      </div>

      <div className="accordion">
        <AccordionItem title="📄 Important Documents">
          {defaultInfo.documents.join(', ')}
        </AccordionItem>

        <AccordionItem title={`ℹ️ ${country} Country Information`} fetchData={fetchCountryInfo}>
          Loading...
        </AccordionItem>

        <AccordionItem title="💰 Financial Management">
          {defaultInfo.expenses}
        </AccordionItem>

        <AccordionItem title="🏨 Accommodation Preparation">
          {defaultInfo.accommodationTips}
        </AccordionItem>

        <AccordionItem title="➕ Other Preparations">
          {defaultInfo.otherTips}
        </AccordionItem>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}
