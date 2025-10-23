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
  const VISA_DOC_REFERENCE = {
  // --- A ---
  'Argentina': {
    documents: 'Passport (valid 6+ months), proof of funds, return ticket. Many nationalities are visa-free for tourism up to 90 days.',
    preparation: 'Check if your nationality needs a visa. If so, apply at an Argentine consulate with required forms and photos.'
  },
  'Australia': {
    documents: 'Passport, completed visa application (usually online via ImmiAccount), digital photo, other supporting documents depending on visa subclass.',
    preparation: 'Mostly electronic visas (e.g., Visitor visa subclass 600). Apply online. Processing times can vary greatly.'
  },
  'Austria': {
    documents: 'Passport (valid 3+ months after departure), Schengen visa application form, recent passport photos, travel insurance, proof of funds and accommodation.',
    preparation: 'Part of the Schengen Area. Apply for a Schengen visa if your nationality requires it. Book appointments well in advance.'
  },

  // --- B ---
  'Belgium': {
    documents: 'Passport, Schengen visa application, photos, travel medical insurance (€30,000 coverage), flight itinerary, proof of accommodation.',
    preparation: 'Schengen Area member. Ensure all documents are complete before your visa center appointment.'
  },
  'Brazil': {
    documents: 'Passport (valid 6+ months). Many nationalities, including those from the US, Canada, and Australia, are now visa-free for tourism.',
    preparation: 'Check the latest visa policy for your specific nationality as it has changed recently. Some may require an e-visa.'
  },
  
  // --- C ---
  'Cambodia': {
    documents: 'Passport (valid 6+ months), one passport-sized photo. Visa on arrival is available at major airports and land borders, or apply for an E-visa online.',
    preparation: 'E-visa is the most convenient option. Apply online a few days before your trip. Visa on Arrival is also straightforward.'
  },
  'Canada': {
    documents: 'Passport. Depending on nationality, you may need a visitor visa (Temporary Resident Visa) or an eTA (Electronic Travel Authorization) if flying.',
    preparation: 'Check the official IRCC website. The eTA process is online and quick. A visitor visa is a much longer and more detailed process.'
  },
  'Chile': {
    documents: 'Passport (valid for the duration of stay). Many nationalities are visa-free for up to 90 days.',
    preparation: 'Check for your nationality. US citizens and others may have to pay a reciprocity fee upon entry.'
  },
  'China': {
    documents: 'Passport (valid 6+ months), completed visa application form (online), appointment confirmation, passport photo (with strict requirements).',
    preparation: 'Visa is required for most visitors. The application process is detailed; start well in advance. You must book an appointment online to submit documents.'
  },
  'Colombia': {
    documents: 'Passport (valid 6+ months). Most nationalities can enter visa-free for tourism for up to 90 days.',
    preparation: 'Ensure your passport is stamped upon entry. Check if any specific health declarations are needed before travel.'
  },
  'Croatia': {
    documents: 'Passport. As a new Schengen Area member (since 2023), Schengen visa rules apply.',
    preparation: 'If you need a Schengen visa, you can enter Croatia with it. Check requirements for your nationality.'
  },

  // --- D ---
  'Denmark': {
    documents: 'Passport (valid 3+ months after departure), Schengen visa application, photos, travel insurance, proof of funds.',
    preparation: 'Schengen Area state. Follow the standard application procedure for a Schengen visa if needed.'
  },

  // --- E ---
  'Egypt': {
    documents: 'Passport (valid 6+ months). Many nationalities can obtain a visa on arrival or apply for an e-Visa online.',
    preparation: 'The e-Visa is recommended to save time at the airport. Apply through the official government portal at least 7 days before travel.'
  },
  'Estonia': {
    documents: 'Passport, Schengen visa application, photo, travel insurance. Part of Schengen Area.',
    preparation: 'Standard Schengen visa application process. Known for its digital infrastructure.'
  },
  
  // --- F ---
  'Finland': {
    documents: 'Passport, Schengen visa application, photos, proof of accommodation, flight itinerary, travel insurance.',
    preparation: 'Schengen Area member. Apply at the designated visa application center for your region.'
  },
  'France': {
    documents: 'Passport (valid 3+ months after departure), Schengen visa application form, two recent passport photos (3.5cm x 4.5cm), flight itinerary, travel insurance.',
    preparation: 'Part of the Schengen Area. Appointments can be scarce, book months ahead, especially for peak season.'
  },

  // --- G ---
  'Germany': {
    documents: 'Passport (valid 3+ months after departure), Schengen visa application form, passport photos, travel medical insurance, proof of funds.',
    preparation: 'Schengen Area member. Be meticulous with your financial proof and travel itinerary.'
  },
  'Greece': {
    documents: 'Passport, Schengen visa application, photos, proof of funds, travel insurance, hotel bookings.',
    preparation: 'Standard Schengen visa process. A popular destination, so apply early.'
  },

  // --- H ---
  'Hong Kong': {
    documents: 'Passport (validity depends on nationality, but 6+ months recommended). Many nationalities have visa-free access for 14 to 180 days.',
    preparation: 'Check the Hong Kong Immigration Department website for your specific nationality\'s visa requirements. Separate from mainland China.'
  },
  'Hungary': {
    documents: 'Passport, Schengen visa application, photo, travel insurance, proof of accommodation and funds.',
    preparation: 'Schengen Area member. Follow standard procedures.'
  },
  
  // --- I ---
  'Iceland': {
    documents: 'Passport, Schengen visa application, photo, travel insurance, details of your itinerary (important for Iceland).',
    preparation: 'Schengen Area country. They may ask for a more detailed travel plan due to the nature of tourism there.'
  },
  'India': {
    documents: 'Passport (valid 6+ months), digital photo, e-Visa application form (for most tourists).',
    preparation: 'Apply for an e-Visa online through the official government website well in advance. Different categories exist (Tourist, Business, Medical).'
  },
  'Indonesia': {
    documents: 'Passport (valid 6+ months). Many nationalities are eligible for a Visa on Arrival (VoA) or are visa-exempt.',
    preparation: 'For VoA, you can pay at the airport upon arrival. Ensure your passport has at least one completely blank page.'
  },
  'Ireland': {
    documents: 'Passport. Ireland is NOT in the Schengen Area. It has its own visa policy. Many are visa-exempt.',
    preparation: 'Check the Irish Immigration website. If you need a visa, it is a separate application from a UK or Schengen visa.'
  },
  'Israel': {
    documents: 'Passport (valid 6+ months). Most Western nationalities have visa-free access for tourism.',
    preparation: 'Be prepared for thorough security questioning at the airport. You get an entry card instead of a passport stamp.'
  },
  'Italy': {
    documents: 'Passport, Schengen visa application, photos, proof of travel medical insurance (€30,000 coverage), proof of sufficient funds.',
    preparation: 'The process is standardized across Schengen countries. Visa centers can be very busy.'
  },

  // --- J ---
  'Japan': {
    documents: 'Passport, visa application form (if needed), recent passport photo (4.5cm x 3.5cm).',
    preparation: 'Many nationalities (including Thai) are visa-free for tourism up to 15 days. For other purposes or nationalities, apply at an embassy.'
  },
  'Jordan': {
    documents: 'Passport (valid 6+ months). Most nationalities can get a visa on arrival. Consider purchasing the "Jordan Pass" online before you travel.',
    preparation: 'The Jordan Pass includes the visa fee and entry to many sites like Petra. It often saves money.'
  },

  // --- K ---
  'Kenya': {
    documents: 'Passport (valid 6+ months), digital photo, e-Visa obtained online before travel.',
    preparation: 'All visitors must now apply for an e-Visa in advance. Visa on arrival is no longer available. Apply via the official government portal.'
  },

  // --- L ---
  'Laos': {
    documents: 'Passport (valid 6+ months), application form, two passport-sized photos. E-visa and Visa on Arrival are available.',
    preparation: 'Visa on Arrival is available at most international entry points. E-visa is also an option for certain entry points.'
  },
  'Latvia': {
    documents: 'Passport, Schengen visa application materials if required.',
    preparation: 'Standard Schengen Area procedure.'
  },

  // --- M ---
  'Malaysia': {
    documents: 'Passport (valid 6+ months). Most nationalities have visa-free access for 14, 30, or 90 days.',
    preparation: 'Must fill out the Malaysia Digital Arrival Card (MDAC) online a few days before arriving.'
  },
  'Maldives': {
    documents: 'Passport (valid 1+ month), confirmed hotel booking, proof of funds. Free 30-day visa on arrival for all nationalities.',
    preparation: 'Have your hotel confirmation ready. A health declaration form must be submitted online before arrival and departure.'
  },
  'Mexico': {
    documents: 'Passport. Many nationalities are visa-free. If you have a valid US, Canada, Japan, UK or Schengen visa, you can also enter visa-free.',
    preparation: 'Check your nationality\'s requirements. You will fill out an FMM form (tourist card) on the plane or upon arrival.'
  },
  'Morocco': {
    documents: 'Passport (valid 6+ months). Many nationalities are visa-free for up to 90 days.',
    preparation: 'Check the list of visa-exempt countries. If a visa is needed, apply at a Moroccan embassy or consulate.'
  },
  'Myanmar': {
    documents: 'Passport (valid 6+ months), E-visa application confirmation, passport photo.',
    preparation: 'Tourism is slowly reopening. An e-Visa must be obtained online before travel. Check official government announcements.'
  },

  // --- N ---
  'Nepal': {
    documents: 'Passport (valid 6+ months), application form, photos. Visa on arrival is widely available at Tribhuvan International Airport (KTM).',
    preparation: 'You can fill out the application form at a kiosk upon arrival or complete it online beforehand to save time.'
  },
  'Netherlands': {
    documents: 'Passport, Schengen visa application, photo, travel insurance, proof of accommodation, flight details.',
    preparation: 'Standard Schengen visa application process.'
  },
  'New Zealand': {
    documents: 'Passport. Many nationalities require an NZeTA (New Zealand Electronic Travel Authority) before travel.',
    preparation: 'Apply for the NZeTA online or via their mobile app. It\'s usually processed quickly but apply at least 72 hours in advance.'
  },
  'Norway': {
    documents: 'Passport, Schengen visa application, photo, detailed itinerary, proof of funds, travel insurance.',
    preparation: 'Part of the Schengen Area, but not the EU. Standard application process.'
  },

  // --- O ---
  'Oman': {
    documents: 'Passport (valid 6+ months). Many nationalities are visa-exempt or can apply for an e-Visa.',
    preparation: 'Check the Royal Oman Police e-Visa website for your specific requirements. The e-Visa is the standard method.'
  },

  // --- P ---
  'Peru': {
    documents: 'Passport (valid 6+ months). Many nationalities are visa-free for up to 90/180 days.',
    preparation: 'Check visa requirements for your nationality. Ensure you get an entry stamp.'
  },
  'Philippines': {
    documents: 'Passport (valid 6+ months), return or outbound ticket. Most nationalities are visa-free for 30 days.',
    preparation: 'You must register with the eTravel system online before your flight.'
  },
  'Poland': {
    documents: 'Passport, Schengen visa application, photos, medical insurance.',
    preparation: 'Standard Schengen Area procedure.'
  },
  'Portugal': {
    documents: 'Passport, Schengen visa application, photos, proof of funds and lodging, travel insurance.',
    preparation: 'Standard Schengen Area procedure. Apply early for summer travel.'
  },

  // --- Q ---
  'Qatar': {
    documents: 'Passport (valid 6+ months), confirmed onward or return ticket. Over 100 nationalities can enter visa-free for 30 or 90 days.',
    preparation: 'Check your eligibility for visa-free entry. Hotel booking may be required.'
  },
  
  // --- R ---
  'Romania': {
    documents: 'Passport. As a new Schengen member (Air/Sea borders), Schengen visa rules apply. Check land border rules.',
    preparation: 'If you have a valid multiple-entry Schengen visa, you could enter. Check the latest rules as they are in transition.'
  },
  'Russia': {
    documents: 'Passport (valid 6+ months after visa expiry), completed application form, passport photos, and an official Tourist Invitation (Voucher).',
    preparation: 'A Tourist Invitation is mandatory and can be obtained from your hotel or an authorized travel agency. The visa process is very strict.'
  },

  // --- S ---
  'Saudi Arabia': {
    documents: 'Passport (valid 6+ months), e-Visa or visa on arrival.',
    preparation: 'Many nationalities are eligible for an e-Visa, which is the easiest way. It includes mandatory medical insurance for COVID-19.'
  },
  'Singapore': {
    documents: 'Passport (valid 6+ months). Many nationalities are visa-free. You must fill out an SG Arrival Card online before entering.',
    preparation: 'Check if your nationality requires a visa. The SG Arrival Card is mandatory for all travelers and must be completed within 3 days of arrival.'
  },
  'South Africa': {
    documents: 'Passport (valid 30+ days after departure, with 2 blank pages), proof of funds, return ticket. Many nationalities are visa-free.',
    preparation: 'Check your country\'s status. If a visa is required, the application process can be lengthy.'
  },
  'South Korea': {
    documents: 'Passport. Most tourists can enter visa-free but must apply for K-ETA (Korea Electronic Travel Authorization) online before travel.',
    preparation: 'Apply for K-ETA at least 72 hours before your flight. Have accommodation details ready for the application.'
  },
  'Spain': {
    documents: 'Passport, Schengen visa application, photos, flight reservations, hotel reservations, travel insurance.',
    preparation: 'One of the most popular Schengen destinations, so visa centers can be busy. Apply early.'
  },
  'Sri Lanka': {
    documents: 'Passport (valid 6+ months), ETA (Electronic Travel Authorization) obtained online.',
    preparation: 'Apply for the ETA online before you travel. The process is quick and simple.'
  },
  'Sweden': {
    documents: 'Passport, Schengen visa application, photos, insurance, tickets, accommodation proof.',
    preparation: 'Standard Schengen Area application.'
  },
  'Switzerland': {
    documents: 'Passport, Schengen visa application, photos, funds, insurance, travel plan.',
    preparation: 'Schengen Area member, not EU. Known for being strict on financial proof.'
  },

  // --- T ---
  'Taiwan': {
    documents: 'Passport (valid 6+ months). Many nationalities are visa-free for up to 90 days.',
    preparation: 'Check the visa-exemption list for your nationality. An online arrival card must be filled out.'
  },
  'Tanzania': {
    documents: 'Passport (valid 6+ months), e-Visa or visa on arrival.',
    preparation: 'Applying for an e-Visa online is highly recommended to avoid long queues at the airport.'
  },
  'Thailand': {
    documents: 'Passport (valid 6+ months), visa application form (if needed), passport photo.',
    preparation: 'Check visa exemption rules based on your nationality. Many are visa-free for 30 days.'
  },
  'Turkey': {
    documents: 'Passport (validity requirements vary by nationality), e-Visa or visa sticker depending on nationality.',
    preparation: 'Many nationalities can easily apply for an e-Visa online. Check the official e-Visa website. Do not use third-party sites.'
  },

  // --- U ---
  'United Arab Emirates': {
    documents: 'Passport. Many nationalities get a free visa on arrival for 30 or 90 days. Others must pre-arrange a visa, usually through an airline or hotel.',
    preparation: 'Check your nationality\'s status. If you need a pre-arranged visa, airlines like Emirates or Etihad can sponsor it if you fly with them.'
  },
  'United Kingdom': {
    documents: 'Passport, completed online application form, Biometrics (fingerprints and photo), proof of funds, supporting documents.',
    preparation: 'NOT in Schengen Area. A separate UK visa is required for many. The process is entirely online but requires an in-person biometrics appointment.'
  },
  'United States': {
    documents: 'Passport (valid 6+ months beyond stay), DS-160 confirmation page, visa fee receipt, appointment confirmation, one 2x2 inch photo.',
    preparation: 'Detailed process. Complete the DS-160 online form accurately. Be prepared for an interview at the embassy. Visa Waiver Program countries need an ESTA.'
  },
  
  // --- V ---
  'Vietnam': {
    documents: 'Passport (valid 6+ months). Depending on nationality, may require an E-visa or be visa-exempt.',
    preparation: 'Check if your nationality is eligible for an E-visa or visa exemption. The online E-visa process is straightforward but apply at least a week in advance.'
  },
  
  // --- DEFAULT ---
  'Default': {
    documents: 'Passport (with at least 6 months validity), completed visa application form, recent passport-sized photographs (usually with a white background).',
    preparation: 'Requirements vary greatly by country and nationality. ALWAYS check the official embassy or consulate website of your destination for accurate, up-to-date information before planning or booking your trip.'
  }
};
  const getDocumentAdvice = (countryName) => {
    const normalizedCountry = Object.keys(VISA_DOC_REFERENCE).find(
      key => key.toLowerCase() === countryName.toLowerCase()
    );
    const advice = normalizedCountry
      ? VISA_DOC_REFERENCE[normalizedCountry]
      : VISA_DOC_REFERENCE['Default'];

      
    return (
      <div>
        <p><strong>Required Documents:</strong> {advice.documents}</p>
        <p><strong>Preparation Tips:</strong> {advice.preparation}</p>
        <p style={{ marginTop: '10px', color: '#0066cc', fontStyle: 'italic' }}>
          *** Always verify complete document list from official embassy website ***
        </p>
      </div>
    );
  };

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
          <p>Currency of {country} is <strong>{currencyName} ({currencyCode})</strong></p>
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
// --- START: Accommodation Data ---
const fetchAccommodationData = async (country) => {
  try {
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.50&current=temperature_2m,weathercode`
    );
    const weatherData = await weatherResponse.json();

    return (
      <div>
        <p><strong>Recommended based on current conditions:</strong></p>
        <p>• Temperature: {weatherData.current.temperature_2m}°C</p>
        <p>• Weather Code: {weatherData.current.weathercode}</p>
        <p>• Always book in advance and check recent reviews</p>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <p>Book in advance and check recent reviews. (Default recommendation)</p>
      </div>
    );
  }
};
// --- END: Accommodation Data ---
  // ✅ Corrected: getOtherPreparations now returns string properly
  const getOtherPreparations = (country, days) => {
    if (days > 90) {
      return "For long stays, ensure your travel insurance covers extended periods and repatriation.";
    }
    if (country === 'Japan' || country === 'South Korea') {
      return "Travel insurance is recommended. Public transport is efficient, but having local cash backup is wise.";
    }
    return "Ensure your passport validity and basic travel essentials are ready.";
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
          {getDocumentAdvice(country)}
        </AccordionItem>
        <AccordionItem title={`ℹ️ ${country} Country Information`} 
        fetchData={fetchCountryInfo} />
        <AccordionItem title="💰 Financial Management" 
        fetchData={fetchFinancialInfo} />
        <AccordionItem title="🏨 Accommodation Preparation" 
        fetchData={() => fetchAccommodationData(country)} />
        <AccordionItem title="➕ Other Preparations">
          {getOtherPreparations(country, days)}
        </AccordionItem>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}
