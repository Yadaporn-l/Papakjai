import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import NavHome from './components/navhome.jsx';
import Footer from './components/footer.jsx';
import "./visapage.css";

export default function Visainfo() {
  const [country, setCountry] = useState(null);
  const [days, setDays] = useState('');
  const [result, setResult] = useState('');
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [errorFetchingCountries, setErrorFetchingCountries] = useState(null);
  
  const navigate = useNavigate();

  const visaInfo = {
    Japan: { maxDays: 30, description: 'Tourist visa for Japan allows up to 30 days.' },
    Thailand: { maxDays: 30, description: 'Tourist visa for Thailand allows up to 30 days.' },
    'South Korea': { maxDays: 90, description: 'Tourist visa for South Korea allows up to 90 days.' },
    'United States': { maxDays: 90, description: 'Tourist visa for USA (ESTA) allows up to 90 days.' },
    India: { maxDays: 90, description: 'Tourist visa for India allows up to 90 days (eVisa).' },
    China: { maxDays: 30, description: 'Tourist visa for China allows up to 30 days.' },
    Russia: { maxDays: 30, description: 'Tourist visa for Russia may require invitation, up to 30 days.' },
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const sortedCountries = data
          .map(c => ({ value: c.name.common, label: c.name.common }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setErrorFetchingCountries("Failed to load country list. Please try again.");
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  const checkVisa = () => {
    // Validation
    if (!country?.value && !days) {
      setResult('Please select a country and enter the number of days.');
      return;
    }
    if (!country?.value) {
      setResult('Please select a country.');
      return;
    }
    if (!days || parseInt(days) <= 0) {
      setResult('Please enter a valid number of days (must be greater than 0).');
      return;
    }

    
    navigate('/visaresult', { 
      state: { 
        country: country.value, 
        days: parseInt(days),
        visaInfo: visaInfo[country.value] 
      } 
    });
  };

  return (
    <>
      <NavHome/>
      <div className="content">
        <h1>VISA INFORMATION</h1>
        <div className="visa-box">
          <p><b>Only Tourist Visa ✈</b></p>
          
          <label htmlFor="country-select">Select country</label>
          <Select
            id="country-select"
            options={countries}
            value={country}
            onChange={(selectedOption) => {
              setCountry(selectedOption);
              setResult(''); 
            }}
            placeholder={
              loadingCountries 
                ? 'Loading countries...' 
                : (errorFetchingCountries ? 'Error loading countries' : 'Select a country')
            }
            isDisabled={loadingCountries || !!errorFetchingCountries}
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: state.isFocused ? '#80bdff' : '#ccc',
                boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 123, 255, 0.25)' : 'none',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              })
            }}
          />
          
          {loadingCountries && <p>Loading country list...</p>}
          {errorFetchingCountries && <p style={{color: 'red'}}>{errorFetchingCountries}</p>}

          <label htmlFor="days">Length of stay (days)</label>
          <input
            type="number"
            id="days"
            placeholder="Day"
            value={days}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                setDays(value);
              }
              setResult('');
            }}
            min="1"
          />
          
          <button onClick={checkVisa}>Check</button>
        </div>
        
        {result && (
          <p
            id="result"
            style={{ 
              marginTop: '20px', 
              fontWeight: 'bold',
              color: result.includes('Please') || result.includes('Error') ? 'red' : 'inherit'
            }}
          >
            {result}
          </p>
        )}
      </div>
      <Footer/>
    </>
  );
}