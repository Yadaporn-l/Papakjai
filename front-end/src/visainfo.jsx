import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import NavHome from './components/navhome.jsx';
import Footer from './components/footer.jsx';
import "./visapage.css";
// this visa ja
export default function Visainfo() {
  const [country, setCountry] = useState(null);
  const [days, setDays] = useState('');
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [errorCountries, setErrorCountries] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name');
        if (!res.ok) throw new Error('Failed to fetch countries');
        const data = await res.json();
        const options = data
          .map(c => ({ value: c.name.common, label: c.name.common }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(options);
      } catch (err) {
        console.error(err);
        setErrorCountries('Failed to load countries');
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  const checkVisa = () => {
    if (!country?.value || !days) return;
    navigate('/visaresult', { state: { country: country.value, days } });
  };

  return (
    <>
      <NavHome/>
      <div className="content">
        <h1>VISA INFORMATION</h1>
        <div className="visa-box">
          <p><b>Only Tourist Visa ✈</b></p>

          <label>Select country</label>
          <Select
            options={countries}
            value={country}
            onChange={setCountry}
            placeholder={loadingCountries ? 'Loading...' : 'Select a country'}
            isDisabled={loadingCountries || !!errorCountries}
          />
          {errorCountries && <p style={{color:'red'}}>{errorCountries}</p>}

          <label>Length of stay (days)</label>
          <input
            type="number"
            value={days}
            onChange={e => setDays(e.target.value)}
            min="1"
          />

          <button onClick={checkVisa}>Check</button>
        </div>
      </div>
      <Footer/>
    </>
  );
}
