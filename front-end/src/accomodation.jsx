import React, { useState, useEffect } from 'react';
import NavHome from './components/navhome';
import Footer from './components/footer';
import './accomodation2.css';

const Accomodation = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalData, setModalData] = useState(null);
  const [budget, setBudget] = useState(5000);
  const [searchQuery, setSearchQuery] = useState('');

  const PAGE_SIZE = 4;
  const MAX_PAGES = 10;

  const hotels = [
    {
      id: 'siam-heritage',
      img: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
      title: 'The Siam Heritage',
      type: 'Hotel / Resort',
      desc: 'Riverside stay with modern Thai rooms and an intimate pool courtyard—quiet but close to the action.',
      location: 'Bangkok Riverside',
      tags: '⭐ Riverside · Cozy Pool · Night markets',
      rating: '4.5',
      reviews: 173,
      price: '3,200฿',
      images: [
        'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800',
        'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800',
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800'
      ]
    },
    // Add more hotel objects as needed
  ];

  const totalPages = Math.min(MAX_PAGES, Math.ceil(hotels.length / PAGE_SIZE));

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  const handleHotelClick = (hotel) => {
    setModalData(hotel);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const slider = document.getElementById('budget');
    const bubble = document.getElementById('budgetBubble');

    const fmt = v => Number(v).toLocaleString('th-TH');

    function setBubble() {
      const min = +slider.min, max = +slider.max, val = +slider.value;
      const percent = (val - min) / (max - min) * 100;  // 0–100
      bubble.textContent = `฿ ${fmt(val)}`;
      bubble.style.left = `calc(${percent}% - 24px)`;   // ชดเชยครึ่งความกว้าง bubble
    }
    slider.addEventListener('input', setBubble);
    setBubble(); // initial

    return () => {
      slider.removeEventListener('input', setBubble);
    };
  }, []);

  return (
    <>
      <NavHome />
      <header className="page-header">
        <div className="container">
          <h1>Accomodation &amp; Restaurant</h1>
        </div>
      </header>

      {/* Content Section */}
      <main className="container layout">
        {/* Sidebar Filter */}
        <aside className="sidebar compact">
          {/* Location */}
          <div className="filter-block">
            <h3>Location</h3>
            <select id="fCountry">
              <option value="">Select Country</option>
              <option>Thailand</option>
              <option>Japan</option>
              <option>China</option>
            </select>
            <input type="text" id="fCity" placeholder="City / Area"
                   style={{ width: '100%', height: '35px', border: '1px solid #9aa4b1', borderRadius: '8px', padding: '0 12px', background: '#fff', marginTop: '8px' }} />
          </div>

          {/* Type (เป็นชิปประหยัดเนื้อที่) */}
          <div className="filter-block">
            <h3>Type</h3>
            <div className="chip-row">
              <button type="button" className="chip" data-type="Hotel & Home">Hotel & Home</button>
              <button type="button" className="chip" data-type="Restaurant">Restaurant</button>
              <button type="button" className="chip" data-type="Beauty & Spa">Beauty & Spa</button>
              <button type="button" className="chip" data-type="Traveling">Traveling</button>
            </div>
          </div>

          {/* Budget (ของเดิม) */}
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
              <button type="button" className="chip" data-min="0" data-max="1550">0–1,550฿</button>
              <button type="button" className="chip" data-min="1550" data-max="4000">1,550–4,000฿</button>
              <button type="button" className="chip" data-min="4000" data-max="7000">4,000–7,000฿</button>
              <button type="button" className="chip" data-min="7000" data-max="11550">&gt;7,000฿</button>
            </div>
          </div>

          {/* Min Rating */}
          <div className="filter-block">
            <h3>Min Rating</h3>
            <div className="chip-row">
              <button type="button" className="chip" data-minscore="4.5">4.5+</button>
              <button type="button" className="chip" data-minscore="4.0">4.0+</button>
              <button type="button" className="chip" data-minscore="3.5">3.5+</button>
              <button type="button" className="chip" data-minscore="3.0">3.0+</button>
            </div>
          </div>

          {/* Must-have (สั้นๆที่คนใช้บ่อย) */}
          <div className="filter-block">
            <h3>Must-have</h3>
            <div className="chip-row">
              <button type="button" className="chip" data-amenity="wifi">Wi-Fi</button>
              <button type="button" className="chip" data-amenity="breakfast">Breakfast</button>
              <button type="button" className="chip" data-amenity="parking">Parking</button>
              <button type="button" className="chip" data-amenity="poolspa">Pool/Spa</button>
            </div>
            <label style={{ display: 'block', marginTop: '8px' }}>
              <input type="checkbox" id="fOpenNow" /> Open now (restaurants & spa)
            </label>
          </div>

          {/* Actions */}
          <div className="filter-actions">
            <button id="applyFilters" type="button" className="btn primary" style={{ padding: '8px 12px' }}>Apply</button>
            <button id="resetFilters" type="button" className="btn ghost" style={{ padding: '8px 12px' }}>Reset</button>
          </div>
        </aside>

        {/* Hotel Results */}
        <section className="results">
          <div className="search-bar">
            <input id="searchInput" type="text" placeholder="Search for hotel, restaurant, all properties" value={searchQuery} onChange={handleSearch} />
            <button id="searchBtn" type="button"><i className="fa fa-search"></i></button>
          </div>

          {hotels.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((hotel, index) => (
            <div key={index} className="hotel-card" data-id={hotel.id} onClick={() => handleHotelClick(hotel)}>
              <img src={hotel.img} alt={hotel.title} />
              <div className="hotel-info">
                <h2>{hotel.title}</h2>
                <p className="type">{hotel.type}</p>
                <p className="desc">{hotel.desc}</p>
                <p className="location"><i className="fa fa-map-marker-alt"></i> {hotel.location}</p>
                <p className="tags">{hotel.tags}</p>
                <p className="rating">Rating: <span>{hotel.rating}</span> ({hotel.reviews} Reviews)</p>
                <p className="price">Price: {hotel.price}</p>
              </div>
            </div>
          ))}

          <nav className="pagination" aria-label="Card pages">
            <button className="page-nav prev" aria-label="Previous page" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>&laquo;</button>
            <div id="pageList" className="page-list">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
              ))}
            </div>
            <button className="page-nav next" aria-label="Next page" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>&raquo;</button>
          </nav>
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
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star"></i>
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
                <a href="#" className="more-info">Read more information</a>
              </aside>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Accomodation;