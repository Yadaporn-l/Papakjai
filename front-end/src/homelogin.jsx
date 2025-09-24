import React from 'react'; // Removed useState as it's not used in this snippet
// import { useUserAuth } from "./context/UserAuthContext"; // This is imported but not used here
import NavHome from './components/navhome';
import Footer from './components/footer';
import "./homelogin.js"
import "./homelogin.css"
// Conventionally, React component names are PascalCase.
// Changed from homelogin to HomeLogin
export default function HomeLogin() {


  
  return (
    <>
      <NavHome />

      <section className="hero">
        <div className="overlay"></div>
        <div className="hero-content container">
          <p className="eyebrow">
            Got <span className="accent">plans</span> for the upcoming holiday?
          </p>
          <p className="sub">
            Whether you’re a solo traveler or seasoned explorer, our smart travel engine helps you
            compare prices, stay up to date on local tips &amp; visa rules, and match best-suited
            destinations. Pack, travel, connect—travel confidently with us by your side.
          </p>
          <div className="hero-search">
            <input type="text" placeholder="Search destination, hotel, food…" />
            <button className="primary">Search</button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Recommend For You</h2>

          <div className="carousel" data-cards="4">
            <button className="nav prev">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="track">
              <a className="city-card" href="#">
                <img src="img/soul.jpg" alt="Tokyo" />
                <div className="city-info">
                  <h3>Tokyo</h3>
                  <span className="pill">Japan</span>
                </div>
              </a>
              <a className="city-card" href="#">
                <img src="img/dubai.jpg" alt="Dubai" />
                <div className="city-info">
                  <h3>Dubai</h3>
                  <span className="pill">UAE</span>
                </div>
              </a>
              <a className="city-card" href="#">
                <img src="img/singapore.jpg" alt="Dubai" />
                <div className="city-info">
                  <h3>Singapore</h3>
                  <span className="pill">Singapore</span>
                </div>
              </a>
              <a className="city-card" href="#">
                <img src="img/china.jpg" alt="China" />
                <div className="city-info">
                  <h3>China</h3>
                  <span className="pill">Asia</span>
                </div>
              </a>
              <a className="city-card" href="#">
                <img src="img/tokyo.jpg" alt="Seoul" />
                <div className="city-info">
                  <h3>Seoul</h3>
                  <span className="pill">Korea</span>
                </div>
              </a>
            </div>
            <button className="nav next">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Popular Properties Worldwide</h2>

          <div className="carousel" data-cards="3">
            <button className="nav prev">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="track">
              <article className="property-card">
                <div className="thumb">
                  <img
                    src="https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop"
                    alt="Harbor Hotel"
                  />
                  <span className="badge">
                    <i className="fa-solid fa-location-dot"></i> Qingdao
                  </span>
                </div>
                <div className="body">
                  <h3>Ocean Plaza Seaview Hotel</h3>
                  <p className="meta">Shandong, China</p>
                  <div className="stars" aria-label="rating 4.5">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star-half-stroke"></i>
                    <span>4.5</span>
                  </div>
                </div>
              </article>

              <article className="property-card">
                <div className="thumb">
                  <img
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop"
                    alt="City Hotel"
                  />
                  <span className="badge">
                    <i className="fa-solid fa-location-dot"></i> Shanghai
                  </span>
                </div>
                <div className="body">
                  <h3>Riverside Bund Boutique</h3>
                  <p className="meta">Huangpu, China</p>
                  <div className="stars">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <span>4.0</span>
                  </div>
                </div>
              </article>

              <article className="property-card">
                <div className="thumb">
                  <img
                    src="https://images.unsplash.com/photo-1488747279002-c8523379faaa?q=80&w=1600&auto=format&fit=crop"
                    alt="City Night"
                  />
                  <span className="badge">
                    <i className="fa-solid fa-location-dot"></i> Shenzhen
                  </span>
                </div>
                <div className="body">
                  <h3>Skyline Night View Hotel</h3>
                  <p className="meta">Guangdong, China</p>
                  <div className="stars">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <span>4.1</span>
                  </div>
                </div>
              </article>

              <article className="property-card">
                <div className="thumb">
                  <img
                    src="https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1600&auto=format&fit=crop"
                    alt="Extra"
                  />
                  <span className="badge">
                    <i className="fa-solid fa-location-dot"></i> Dalian
                  </span>
                </div>
                <div className="body">
                  <h3>Bay Resort Hotel</h3>
                  <p className="meta">Liaoning, China</p>
                  <div className="stars">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <span>3.2</span>
                  </div>
                </div>
              </article>
            </div>
            <button className="nav next">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Budget-Friendly Properties Worldwide</h2>

          <div className="grid grid-3">
            <article className="property-row">
              <img src="img/LuxGuesthouse_seoul.jpg" alt="LuxGuesthouse_seoul" />
              <div className="info">
                <h3>Lux Guesthouse</h3>
                <p className="meta">Seoul, South Korea</p>
                <div className="stars small">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-regular fa-star"></i>
                  <i className="fa-regular fa-star"></i>
                  <span>3.6</span>
                </div>
              </div>
              <div className="price">
                <span className="value">$12.96</span>
                <span className="unit">/night</span>
                <button className="outline">View</button>
              </div>
            </article>

            <article className="property-row">
              <img src="img/JCHome_bkk.jpg" alt="JC_Home" />
              <div className="info">
                <h3>JC Home</h3>
                <p className="meta">Bangkok, Thailand</p>
                <div className="stars small">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-regular fa-star"></i>
                  <i className="fa-regular fa-star"></i>
                  <i className="fa-regular fa-star"></i>
                  <span>4.1</span>
                </div>
              </div>
              <div className="price">
                <span className="value">$17.33</span>
                <span className="unit">/night</span>
                <button className="outline">View</button>
              </div>
            </article>

            <article className="property-row">
              <img src="img/hostel_vitenam.jpg" alt="hostel_vitenam" />
              <div className="info">
                <h3>Hanoi New Comb Hostel</h3>
                <p className="meta">Hanoi, Vietnam</p>
                <div className="stars small">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-regular fa-star"></i>
                  <span>3.9</span>
                </div>
              </div>
              <div className="price">
                <span className="value">$5.32</span>
                <span className="unit">/night</span>
                <button className="outline">View</button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Restaurant Trending</h2>

          <div className="carousel" data-cards="4">
            <button className="nav prev">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="track">
              <article className="food-card">
                <img src="img/pasta.jpg" alt="Burger" />
              
                <div className="food-body">
    
                  <h3>Haruki Sushi Bar</h3>
                  <p className="meta">
                    <i className="fa-solid fa-location-dot"></i> Shinjuku, Tokyo
                  </p>
                  <div className="stars tiny">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <span>4.1</span>
                  </div>
                </div>
              </article>

              <article className="food-card">
                <img src="img/burger.jpg" alt="Burger" />
                <div className="food-body">
                  <h3>Stacked Burger Co.</h3>
                  <p className="meta">
                    <i className="fa-solid fa-location-dot"></i> Singapore
                  </p>
                  <div className="stars tiny">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <span>3.0</span>
                  </div>
                </div>
              </article>

              <article className="food-card">
                <img
                  src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1600&auto=format&fit=crop"
                  alt="Fried"
                />
                <div className="food-body">
                  <h3>Golden Fry Shack</h3>
                  <p className="meta">
                    <i className="fa-solid fa-location-dot"></i> Kuala Lumpur
                  </p>
                  <div className="stars tiny">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                    <span>2.0</span>
                  </div>
                </div>
              </article>

              <article className="food-card">
                <img src="img/pasta.jpg" alt="Pasta" />
                <div className="food-body">
                  <h3>Pasta Nostra</h3>
                  <p className="meta">
                    <i className="fa-solid fa-location-dot"></i> Milan
                  </p>
                  <div className="stars tiny">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <span>5.0</span>
                  </div>
                </div>
              </article>
            </div>
            <button className="nav next">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}