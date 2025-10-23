import React, { useState, useEffect } from 'react';
import NavHome from './components/navhome';
import Footer from './components/footer';
import './accomodation2.css';


const Accomodation = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalData, setModalData] = useState(null);
  const [budget, setBudget] = useState(5000);
  const [searchQuery, setSearchQuery] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const PAGE_SIZE = 4;
  const MAX_PAGES = 10;
  const OPENTRIPMAP_API_KEY = '5ae2e3f221c38a28845f05b6c1d464b4f05b0cd66cd8e4d5e75e7f42';

  // Load recently viewed from storage
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const result = await window.storage.get('recently-viewed');
        if (result) {
          setRecentlyViewed(JSON.parse(result.value));
        }
      } catch (err) {
        console.log('No recently viewed items');
      }
    };
    loadRecentlyViewed();
    
    // Initialize with sample data
    setHotels(getSampleHotels());
  }, []);

  const saveRecentlyViewed = async (hotel) => {
    const updated = [hotel, ...recentlyViewed.filter(h => h.id !== hotel.id)].slice(0, 5);
    setRecentlyViewed(updated);
    try {
      await window.storage.set('recently-viewed', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save recently viewed');
    }
  };

  const getSampleHotels = () => {
    const sampleHotels = [];
    const hotelNames = [
      'Fairmont Peace Hotel',
      'Grand Plaza Resort',
      'Royal Heritage Inn',
      'Riverside Boutique',
      'Urban Comfort Suites',
      'Paradise Beach Resort',
      'Mountain View Lodge',
      'City Center Hotel',
      'Luxury Garden Villa',
      'Sunset Bay Resort',
      'Metropolitan Towers',
      'Tranquil Spa Hotel'
    ];
    
    const cities = ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi'];
    
    for (let i = 0; i < 12; i++) {
      const priceBase = Math.floor(Math.random() * 8000 + 2000);
      const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
      
      sampleHotels.push({
        id: `hotel-${i}`,
        img: `https://images.pexels.com/photos/${271624 + i * 1000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800&h=600`,
        title: hotelNames[i],
        type: 'Hotel / Resort',
        desc: 'This is a stylish hotel with a view of the city. Travellers have said it is one of the most beautiful hotels they have ever stayed in. The hotel facilities are complete and there are many restaurants nearby for the convenience of customers.',
        location: 'Khao Yai Rd - The Bend Area',
        fullAddress: cities[Math.floor(Math.random() * cities.length)],
        tags: '⭐ Riverside · Cozy Pool · Night markets',
        rating: rating,
        reviews: Math.floor(Math.random() * 500 + 50),
        price: priceBase,
        priceFormatted: `฿${priceBase.toLocaleString()}`,
        images: [
          `https://images.pexels.com/photos/${271624 + i * 1000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800`,
          'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800',
          'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800'
        ]
      });
    }
    return sampleHotels;
  };

  const fetchAccommodations = async (cityName) => {
    if (!cityName) return;
    
    setLoading(true);
    try {
      const geoResponse = await fetch(
        `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(cityName)}&apikey=${OPENTRIPMAP_API_KEY}`
      );
      const geoData = await geoResponse.json();
      
      if (geoData.lat && geoData.lon) {
        const placesResponse = await fetch(
          `https://api.opentripmap.com/0.1/en/places/radius?radius=10000&lon=${geoData.lon}&lat=${geoData.lat}&kinds=accomodations&limit=50&apikey=${OPENTRIPMAP_API_KEY}`
        );
        const placesData = await placesResponse.json();
        
        const detailedHotels = await Promise.all(
          placesData.features.slice(0, 20).map(async (feature) => {
            try {
              const detailResponse = await fetch(
                `https://api.opentripmap.com/0.1/en/places/xid/${feature.properties.xid}?apikey=${OPENTRIPMAP_API_KEY}`
              );
              const detail = await detailResponse.json();
              
              const priceBase = Math.floor(Math.random() * 8000 + 2000);
              const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
              
              return {
                id: feature.properties.xid,
                img: detail.preview?.source || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                title: feature.properties.name || 'Accommodation',
                type: 'Hotel / Resort',
                desc: detail.wikipedia_extracts?.text?.substring(0, 200) || 'Comfortable accommodation in a great location with modern amenities.',
                location: `${detail.address?.road || ''} ${detail.address?.city || cityName}`.trim(),
                fullAddress: detail.address?.city || cityName,
                tags: detail.kinds?.split(',').slice(0, 3).join(' · ') || 'Accommodation',
                rating: rating,
                reviews: Math.floor(Math.random() * 500 + 50),
                price: priceBase,
                priceFormatted: `฿${priceBase.toLocaleString()}`,
                images: [
                  detail.preview?.source || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
                  'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
                  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
                ]
              };
            } catch (err) {
              return null;
            }
          })
        );
        
        setHotels(detailedHotels.filter(h => h !== null));
      }
    } catch (error) {
      console.error('Error fetching accommodations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    if (city) {
      fetchAccommodations(city);
    }
  };

  const handleResetFilters = () => {
    setCountry('');
    setCity('');
    setSelectedType('');
    setSelectedRating('');
    setSelectedAmenities([]);
    setBudget(5000);
    setSearchQuery('');
    setHotels(getSampleHotels());
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hotel.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBudget = hotel.price <= budget;
    const matchesRating = !selectedRating || parseFloat(hotel.rating) >= parseFloat(selectedRating);
    
    return matchesSearch && matchesBudget && matchesRating;
  });

  const totalPages = Math.min(MAX_PAGES, Math.ceil(filteredHotels.length / PAGE_SIZE));

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  const handleHotelClick = (hotel) => {
    setModalData(hotel);
    saveRecentlyViewed(hotel);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleType = (type) => {
    setSelectedType(selectedType === type ? '' : type);
  };

  const toggleRating = (rating) => {
    setSelectedRating(selectedRating === rating ? '' : rating);
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  useEffect(() => {
    const slider = document.getElementById('budget');
    const bubble = document.getElementById('budgetBubble');

    if (!slider || !bubble) return;

    const fmt = v => Number(v).toLocaleString('th-TH');

    function setBubble() {
      const min = +slider.min, max = +slider.max, val = +slider.value;
      const percent = (val - min) / (max - min) * 100;
      bubble.textContent = `฿ ${fmt(val)}`;
      bubble.style.left = `calc(${percent}% - 24px)`;
    }
    slider.addEventListener('input', setBubble);
    setBubble();

    return () => {
      slider.removeEventListener('input', setBubble);
    };
  }, []);

  return (
    <>
      <NavHome />
      <header className="page-header">
        <div className="container">
          <h1>Accommodation &amp; Restaurant</h1>
        </div>
      </header>

      {/* Content Section */}
      <main className="container layout">
        {/* Sidebar Filter */}
        <aside className="sidebar compact">
          {/* Location */}
          <div className="filter-block">
            <h3>Location</h3>
            <select id="fCountry" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Select Country</option>
              <option>Thailand</option>
              <option>Japan</option>
              <option>China</option>
              <option>Vietnam</option>
              <option>Singapore</option>
            </select>
            <input 
              type="text" 
              id="fCity" 
              placeholder="City / Area"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              style={{ width: '100%', height: '35px', border: '1px solid #9aa4b1', borderRadius: '8px', padding: '0 12px', background: '#fff', marginTop: '8px' }} 
            />
          </div>

          {/* Type */}
          <div className="filter-block">
            <h3>Type</h3>
            <div className="chip-row">
              <button 
                type="button" 
                className={`chip ${selectedType === 'Hotel & Home' ? 'active' : ''}`}
                onClick={() => toggleType('Hotel & Home')}
              >
                Hotel & Home
              </button>
              <button 
                type="button" 
                className={`chip ${selectedType === 'Restaurant' ? 'active' : ''}`}
                onClick={() => toggleType('Restaurant')}
              >
                Restaurant
              </button>
              <button 
                type="button" 
                className={`chip ${selectedType === 'Beauty & Spa' ? 'active' : ''}`}
                onClick={() => toggleType('Beauty & Spa')}
              >
                Beauty & Spa
              </button>
              <button 
                type="button" 
                className={`chip ${selectedType === 'Traveling' ? 'active' : ''}`}
                onClick={() => toggleType('Traveling')}
              >
                Traveling
              </button>
            </div>
          </div>

          {/* Budget */}
          <div className="filter-block">
            <h3>Budget</h3>
            <div className="budget-head">
              <span>Budget Range</span>
              <span>(฿ 0 – 11,550+)</span>
            </div>
            <div className="range">
              <input id="budget" type="range" min="0" max="11550" value={budget} step="50" onChange={handleBudgetChange} />
              <output id="budgetBubble" htmlFor="budget"></output>
              <div className="range-scale">
                <span>฿ 0</span><span>฿ 11,550+</span>
              </div>
            </div>
            <div className="budget-tags" id="budgetTags">
              <button type="button" className="chip" onClick={() => setBudget(1550)}>0–1,550฿</button>
              <button type="button" className="chip" onClick={() => setBudget(4000)}>1,550–4,000฿</button>
              <button type="button" className="chip" onClick={() => setBudget(7000)}>4,000–7,000฿</button>
              <button type="button" className="chip" onClick={() => setBudget(11550)}>&gt;7,000฿</button>
            </div>
          </div>

          {/* Min Rating */}
          <div className="filter-block">
            <h3>Min Rating</h3>
            <div className="chip-row">
              <button 
                type="button" 
                className={`chip ${selectedRating === '4.5' ? 'active' : ''}`}
                onClick={() => toggleRating('4.5')}
              >
                4.5+
              </button>
              <button 
                type="button" 
                className={`chip ${selectedRating === '4.0' ? 'active' : ''}`}
                onClick={() => toggleRating('4.0')}
              >
                4.0+
              </button>
              <button 
                type="button" 
                className={`chip ${selectedRating === '3.5' ? 'active' : ''}`}
                onClick={() => toggleRating('3.5')}
              >
                3.5+
              </button>
              <button 
                type="button" 
                className={`chip ${selectedRating === '3.0' ? 'active' : ''}`}
                onClick={() => toggleRating('3.0')}
              >
                3.0+
              </button>
            </div>
          </div>

          {/* Must-have */}
          <div className="filter-block">
            <h3>Must-have</h3>
            <div className="chip-row">
              <button 
                type="button" 
                className={`chip ${selectedAmenities.includes('wifi') ? 'active' : ''}`}
                onClick={() => toggleAmenity('wifi')}
              >
                Wi-Fi
              </button>
              <button 
                type="button" 
                className={`chip ${selectedAmenities.includes('breakfast') ? 'active' : ''}`}
                onClick={() => toggleAmenity('breakfast')}
              >
                Breakfast
              </button>
              <button 
                type="button" 
                className={`chip ${selectedAmenities.includes('parking') ? 'active' : ''}`}
                onClick={() => toggleAmenity('parking')}
              >
                Parking
              </button>
              <button 
                type="button" 
                className={`chip ${selectedAmenities.includes('poolspa') ? 'active' : ''}`}
                onClick={() => toggleAmenity('poolspa')}
              >
                Pool/Spa
              </button>
            </div>
            <label style={{ display: 'block', marginTop: '8px' }}>
              <input type="checkbox" id="fOpenNow" /> Open now (restaurants & spa)
            </label>
          </div>

          {/* Recently Views */}
          {recentlyViewed.length > 0 && (
            <div className="filter-block">
              <h3>Recently Views</h3>
              <div className="recently-viewed-list">
                {recentlyViewed.slice(0, 3).map(hotel => (
                  <div 
                    key={hotel.id}
                    className="recent-item"
                    onClick={() => handleHotelClick(hotel)}
                    style={{ cursor: 'pointer', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '8px', display: 'flex', gap: '8px' }}
                  >
                    <img src={hotel.img} alt={hotel.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hotel.title}</h4>
                      <div style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>⭐ {hotel.rating}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#00bcd4', fontWeight: '600', marginTop: '4px' }}>Excellent</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="filter-actions">
            <button 
              id="applyFilters" 
              type="button" 
              className="btn primary" 
              style={{ padding: '8px 12px' }}
              onClick={handleApplyFilters}
            >
              Apply
            </button>
            <button 
              id="resetFilters" 
              type="button" 
              className="btn ghost" 
              style={{ padding: '8px 12px' }}
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </div>
        </aside>

        {/* Hotel Results */}
        <section className="results">
          <div className="search-bar">
            <input 
              id="searchInput" 
              type="text" 
              placeholder="Search for hotel, restaurant, all properties" 
              value={searchQuery} 
              onChange={handleSearch} 
            />
            <button id="searchBtn" type="button"><i className="fa fa-search"></i></button>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #00bcd4', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '20px', color: '#666' }}>Loading accommodations...</p>
            </div>
          )}

          {/* Hotel Cards */}
          {!loading && filteredHotels.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((hotel, index) => (
            <div key={index} className="hotel-card" data-id={hotel.id} onClick={() => handleHotelClick(hotel)}>
              <img src={hotel.img} alt={hotel.title} />
              <div className="hotel-info">
                <h2>{hotel.title}</h2>
                <p className="type">{hotel.type}</p>
                <p className="desc">{hotel.desc}</p>
                <p className="location"><i className="fa fa-map-marker-alt"></i> {hotel.location}</p>
                <p className="tags">{hotel.tags}</p>
                <p className="rating">
                  <span className="badge">{hotel.rating}</span> 
                  <span style={{ marginLeft: '8px' }}>({hotel.reviews.toLocaleString()} Reviews)</span>
                </p>
                <p className="price">Price: <strong>{hotel.priceFormatted}</strong></p>
              </div>
            </div>
          ))}

          {/* No Results */}
          {!loading && filteredHotels.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>No accommodations found</p>
              <p style={{ color: '#999' }}>Try adjusting your filters or search in a different location</p>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredHotels.length > 0 && (
            <nav className="pagination" aria-label="Card pages">
              <button 
                className="page-nav prev" 
                aria-label="Previous page" 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                disabled={currentPage <= 1}
              >
                &laquo;
              </button>
              <div id="pageList" className="page-list">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i} 
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} 
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                className="page-nav next" 
                aria-label="Next page" 
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                disabled={currentPage >= totalPages}
              >
                &raquo;
              </button>
            </nav>
          )}
        </section>
      </main>

      {/* Hotel Detail Modal */}
      {modalData && (
        <div id="hotelModal" className="modal show" aria-hidden="false" role="dialog" aria-modal="true">
          <div className="modal-backdrop" onClick={closeModal}></div>
          <div className="modal-panel" role="document">
            <div className="modal-head">
              <button className="modal-back" aria-label="Back" onClick={closeModal}>
                <i className="fa-solid fa-angle-left"></i> Back
              </button>
              <div className="hotel-title">
                <h2 id="mTitle">{modalData.title}</h2>
                <div className="meta">
                  <span className="rating">
                    <span id="mScore">{modalData.rating}</span>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={i < Math.floor(modalData.rating) ? 'fa-solid fa-star' : 'fa-regular fa-star'}></i>
                    ))}
                  </span>
                  <span className="travel-tip">
                    <i className="fa-solid fa-cloud-sun"></i> Perfect to travel
                  </span>
                </div>
                <div className="m-sub">
                  <span className="type" id="mType">{modalData.type}</span>
                  <span className="dot">•</span>
                  <span className="m-location"><i className="fa-solid fa-location-dot"></i> <span id="mLoc">{modalData.location}</span></span>
                </div>
              </div>
              <button className="modal-close" aria-label="Close" onClick={closeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Body: 2 columns */}
            <div className="modal-body">
              {/* Left: gallery */}
              <div className="gallery">
                <div className="hero-img">
                  <img id="mHero" src={modalData.img} alt="Hotel photo" />
                </div>
                <div className="thumbs" id="mThumbs" aria-label="More photos">
                  {modalData.images.map((image, index) => (
                    <button key={index} type="button" className={`t ${index === 0 ? 'active' : ''}`} onClick={() => document.getElementById('mHero').src = image}>
                      <img src={image} alt={`Thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: amenities */}
              <aside className="amenities">
                <h3>Hotel Amenities</h3>
                <ul className="amenity-list">
                  <li><i className="fa-solid fa-person-swimming"></i> Indoor Swimming Pool</li>
                  <li><i className="fa-solid fa-spa"></i> Spa</li>
                  <li><i className="fa-solid fa-hand-holding-heart"></i> Massage Room</li>
                  <li><i className="fa-solid fa-crown"></i> Executive lounge</li>
                  <li><i className="fa-solid fa-dumbbell"></i> Gym</li>
                  <li><i className="fa-solid fa-square-parking"></i> Private Parking</li>
                  <li><i className="fa-solid fa-plane-arrival"></i> Priority airport pick-up</li>
                  <li><i className="fa-solid fa-martini-glass-citrus"></i> Bar</li>
                  <li><i className="fa-solid fa-mug-hot"></i> Tea room</li>
                </ul>
                <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00bcd4', marginBottom: '16px' }}>
                    {modalData.priceFormatted}
                  </div>
                  <button 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      background: '#00bcd4', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      marginBottom: '8px'
                    }}
                  >
                    Book Now
                  </button>
                </div>
                <a href="#" className="more-info">Read more information</a>
              </aside>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .chip.active {
          background: #00bcd4;
          color: white;
          border-color: #00bcd4;
        }
        .badge {
          background: #dc3545;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 14px;
        }
      `}</style>
    </>
  );
};

export default Accomodation;