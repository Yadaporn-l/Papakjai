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

    if (!open && fetchData && !content) {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchData();
        setContent(data);
      } catch (err) {
        setError('Failed to load data. Please try again.');
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
          {error && <p style={{ color: 'red' }}>{error}</p>}
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

  // ✅ API Key FastForex
  const EXCHANGE_RATE_API_KEY = "e4699491c5-a4c761eb38-t4k1jg";

  // --- START: API & Data functions ---

  const fetchCountryInfo = async () => {
    const res = await fetch(`https://restcountries.com/v3.1/name/${country}?fullText=true`);
    if (!res.ok) throw new Error(`Country not found: ${res.status}`);
    const data = await res.json();
    const c = data[0];
    const currencyCode = Object.keys(c.currencies)[0];
    const currencyName = c.currencies[currencyCode].name;

    return (
      <div>
        <p><strong>Official Name:</strong> {c.name.official}</p>
        <p><strong>Region:</strong> {c.region}</p>
        <p><strong>Subregion:</strong> {c.subregion || 'N/A'}</p>
        <p><strong>Languages:</strong> {Object.values(c.languages).join(', ')}</p>
        <p><strong>Currency:</strong> {`${currencyName} (${currencyCode})`}</p>
        <p><strong>Timezones:</strong> {c.timezones.join(', ')}</p>
        <p><strong>Population:</strong> {c.population.toLocaleString()}</p>
      </div>
    );
  };

  const fetchFinancialInfo = async () => {
    try {
      // 1. ดึงข้อมูลประเทศเพื่อหาสกุลเงินและธง
      const countryRes = await fetch(`https://restcountries.com/v3.1/name/${country}?fullText=true`);
      if (!countryRes.ok) throw new Error("Could not find country to get currency.");
      const countryData = await countryRes.json();
      const currencyCode = Object.keys(countryData[0].currencies)[0];
      const currencyName = countryData[0].currencies[currencyCode].name;
      const flag = countryData[0].flags?.png;

      // 2. ดึงอัตราแลกเปลี่ยน (base: THB) จาก FastForex
      const exchangeRateRes = await fetch(`https://api.fastforex.io/fetch-one?from=THB&to=${currencyCode}&api_key=${EXCHANGE_RATE_API_KEY}`);
      if (!exchangeRateRes.ok) throw new Error("Could not fetch exchange rates.");
      const exchangeData = await exchangeRateRes.json();

      // ✅ แก้ไขตรงนี้: ใช้ exchangeData.result
      const rate = exchangeData?.result?.[currencyCode];
      if (!rate) throw new Error(`Exchange rate not found for ${currencyCode}`);

      return (
        <div>
          {flag && <img src={flag} alt={`${country} flag`} style={{ width: '80px', borderRadius: '8px' }} />}
          <p>Currency of {country} คือ <strong>{currencyName} ({currencyCode})</strong></p>
          <p>
            💱 Current exchange rate:<br />
            <strong>1 {currencyCode} ≈ {(1 / rate).toFixed(2)} THB</strong><br />
            (or 1 THB ≈ {rate.toFixed(4)} {currencyCode})
          </p>
          <p><em>💡 Tip: It’s recommended to exchange money in advance for the best rate and to carry some cash as a backup.</em></p>
        </div>
      );

    } catch (error) {
      console.error("Error in fetchFinancialInfo:", error);
      throw error;
    }
  };

  // --- END: API & Data functions ---

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
          {"Passport, Visa application form, Photo"}
        </AccordionItem>

        <AccordionItem title={`ℹ️ ${country} Country Information`} fetchData={fetchCountryInfo} />

        <AccordionItem title="💰 Financial Management" fetchData={fetchFinancialInfo} />

        <AccordionItem title="🏨 Accommodation Preparation">
          Book in advance, check reviews.
        </AccordionItem>

        <AccordionItem title="➕ Other Preparations">
          Travel insurance recommended.
        </AccordionItem>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}
