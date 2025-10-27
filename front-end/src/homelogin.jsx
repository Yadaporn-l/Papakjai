import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from './components/footer';
import NavHome from './components/navhome';
import { useUserAuth } from './context/UserAuthContext';
import { useNavigate } from 'react-router-dom';

export default function HomeLogin() {
  const { user, logOut } = useUserAuth();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [nextPageToken, setNextPageToken] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('any');
  const [sortBy, setSortBy] = useState('relevance');
  const [activeTab, setActiveTab] = useState('search');
  const [previewModal, setPreviewModal] = useState({ 
    open: false, 
    videoId: null, 
    videoData: null 
  });

  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
  
  const userId = user?.uid || null;

  // ✅ ลบ useEffect ที่ redirect ผู้ใช้ที่ไม่ได้ล็อกอิน
  useEffect(() => {
    if (!user) {
      console.log('Guest user - limited features');
    }
  }, [user]);

  // ✅ Logout เมื่อปิดหน้าเว็บ (เฉพาะผู้ที่ล็อกอิน)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        logOut();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, logOut]);

  const categories = [
    { id: 'all', label: '🌏 All' }, 
    { id: 'beach', label: '🏖️ Beach' },
    { id: 'mountain', label: '⛰️ Mountain' }, 
    { id: 'city', label: '🏙️ City' },
    { id: 'temple', label: '🛕 Temples' }, 
    { id: 'food', label: '🍜 Food' },
    { id: 'adventure', label: '🎢 Adventure' }, 
    { id: 'nature', label: '🌿 Nature' },
    { id: 'shopping', label: '🛍️ Shopping' }
  ];

  const regions = [
    { id: 'all', label: '🌏 Worldwide' }, 
    { id: 'thailand', label: '🇹🇭 Thailand' },
    { id: 'japan', label: '🇯🇵 Japan' }, 
    { id: 'korea', label: '🇰🇷 Korea' },
    { id: 'singapore', label: '🇸🇬 Singapore' }, 
    { id: 'vietnam', label: '🇻🇳 Vietnam' },
    { id: 'indonesia', label: '🇮🇩 Indonesia' }, 
    { id: 'malaysia', label: '🇲🇾 Malaysia' }
  ];

  useEffect(() => {
    if (activeTab === 'search') {
      fetchVideos(true);
    } else if (activeTab === 'favorites' && user) {
      fetchFavorites();
    }
  }, [selectedCategory, selectedRegion, selectedDuration, sortBy, activeTab, user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const timeAgo = (iso) => {
    try {
      const then = new Date(iso);
      const diff = (Date.now() - then.getTime()) / 1000;
      if (diff < 60) return 'just now';
      if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
      return then.toLocaleDateString('th-TH');
    } catch { return ''; }
  };

  const fetchVideos = async (reset = false) => {
    const isLoadingMore = !reset;
    
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setVideos([]);
      setNextPageToken(null);
    }
    
    setError('');
    
    try {
      const params = new URLSearchParams({
        query: searchQuery || 'travel guide',
        category: selectedCategory,
        region: selectedRegion,
        duration: selectedDuration,
        sortBy: sortBy,
        maxResults: 24
      });

      if (isLoadingMore && nextPageToken) {
        params.append('pageToken', nextPageToken);
      }

      const res = await fetch(`${API_URL}/videos/search?${params}`);
      const json = await res.json();
      
      if (!json.success) throw new Error(json.error || 'An error occurred');
      
      if (isLoadingMore) {
        setVideos(prev => [...prev, ...(json.data || [])]);
      } else {
        setVideos(json.data || []);
      }
      
      setNextPageToken(json.nextPageToken || null);
      setCached(Boolean(json.cached));
      
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load data');
    } finally {
      if (isLoadingMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchFavorites = async () => {
    if (!userId) {
      console.log('No user logged in');
      setFavorites([]);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/videos/favorites/${userId}`);
      const json = await res.json();
      
      if (!json.success) throw new Error(json.error || 'An error occurred');
      
      setFavorites(json.data || []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (video) => {
    // ✅ ปรับปรุงข้อความแจ้งเตือนให้ชัดเจนขึ้น
    if (!userId) {
      showToast('🔒 Please log in to use the favorites feature');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
      return;
    }
    
    const videoId = video.videoId || video?.id?.videoId;
    const snippet = video.videoData || video.snippet;
    const isFav = favorites.some((f) => f.videoId === videoId);

    if (isFav) {
      setFavorites((prev) => prev.filter((f) => f.videoId !== videoId));
      showToast('❤️ Removed from favorites');
    } else {
      setFavorites((prev) => [{ userId, videoId, videoData: snippet, createdAt: new Date() }, ...prev]);
      showToast('❤️ Added to favorites');
    }

    try {
      if (isFav) {
        await fetch(`${API_URL}/videos/favorite/${userId}/${videoId}`, { 
          method: 'DELETE' 
        });
      } else {
        await fetch(`${API_URL}/videos/favorite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, videoId, videoData: snippet }),
        });
      }
    } catch (e) {
      console.error(e);
      fetchFavorites();
      showToast('❌ An error occurred, Please try again');
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    if (activeTab !== 'search') setActiveTab('search');
    fetchVideos(true);
  };

  const handleLoadMore = () => {
    if (nextPageToken && !loadingMore) {
      fetchVideos(false);
    }
  };

  const listToRender = activeTab === 'search' ? videos : favorites;

  return (
    <div className="min-h-screen bg-light">
      {toast && (
        <div 
          className="position-fixed top-0 start-50 translate-middle-x mt-4 bg-dark text-white px-4 py-3 rounded shadow-lg"
          style={{ zIndex: 9999 }}
        >
          {toast}
        </div>
      )}

      <NavHome />

      <header className="bg-gradient text-white py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
              <h1 className="text-black h2 fw-bold mb-2">🌏 Travel Video Guide</h1>
              <p className="text-black mb-0 opacity-90">Discover amazing places through high-quality travel videos</p>
              {!user && (
                <p className="text-black mb-0 opacity-75 small mt-1">
                  💡 <strong>Log in</strong> to save your favorite videos
                </p>
              )}
            </div>
            
            <div className="d-flex align-items-center gap-3 align-self-end align-self-md-center ms-md-auto">
              {/* {user && (
                <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-pill px-3 py-2">
                  <div 
                    className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <span className="text-purple fw-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )} */}
              
              <div className="d-flex gap-2">
                {activeTab === 'favorites' && (
                  <button 
                    onClick={() => setActiveTab('search')} 
                    className="btn text-black btn-light"
                  >
                    Back
                  </button>
                )}

                {/* ✅ ปุ่มรายการโปรด - แสดงเฉพาะผู้ที่ล็อกอิน */}
                {user && (
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    className={`btn ${activeTab === 'favorites' ? 'btn-light text-black' : 'btn-outline-light text-black'} position-relative`}
                  >
                    ❤️ Favorites
                    {favorites.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-white">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {activeTab === 'search' && (
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="bg-white rounded-3 shadow-sm p-2">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-0">🔎</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                      placeholder="Search destinations, e.g. Japan, Bali, Street Food..."
                      className="form-control border-0 shadow-none"
                    />
                    <button 
                      type="button" 
                      onClick={handleSearch} 
                      className="btn btn-warning fw-bold px-4"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {activeTab === 'search' && (
        <div className="bg-white border-bottom shadow-sm py-3 ">
          <div className="container">
            <div className="mb-3 overflow-auto">
              <div className="d-flex gap-2 pb-2" style={{ flexWrap: 'nowrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`btn btn-sm rounded-pill flex-shrink-0 ${
                      selectedCategory === cat.id ? 'bg-info text-black border-0.5' : 'btn-primary bg-white text-black'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="row g-2">
              <div className="col-md-4">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="form-select form-select-sm"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="form-select form-select-sm"
                >
                  <option value="any">⏱️ Any length</option>
                  <option value="short">Short (&lt; 4 mins)</option>
                  <option value="medium">Medium (4–20 mins)</option>
                  <option value="long">Long (&gt; 20 mins)</option>
                </select>
              </div>

              <div className="col-md-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select form-select-sm"
                >
                  <option value="relevance">📊 Most relevant</option>
                  <option value="date">🆕 Latest</option>
                  <option value="viewCount">👁️ Most viewed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container py-4">
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <svg className="me-2" width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <>
            <h2 className="h4 mb-4">Loading...</h2>
            <div className="row g-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 mb-0 text-black">
                {activeTab === 'search' 
                  ? `All Videos` 
                  : `Favorites (${favorites.length})`
                }
              </h2>
            </div>

            {listToRender.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3" style={{ fontSize: '4rem' }}>
                  {activeTab === 'search' ? '🔍' : '❤️'}
                </div>
                <h3 className="h5 text-muted">
                  {activeTab === 'search'
                    ? 'No videos matched your search'
                    : 'No favorites yet'
                  }
                </h3>
                <p className="text-muted">
                  {activeTab === 'search'
                    ? 'Try changing your search or filters'
                    : 'Tap ❤️ to add videos you love'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {listToRender.map((video, idx) => (
                    <div 
                      key={video.id?.videoId || video.videoId || idx} 
                      className="col-12 col-sm-6 col-md-4 col-lg-3"
                    >
                      <VideoCard
                        video={video}
                        favorites={favorites}
                        onFavorite={toggleFavorite}
                        onPreview={(id, data) => setPreviewModal({ open: true, videoId: id, videoData: data })}
                        timeAgo={timeAgo}
                        isLoggedIn={!!user}
                      />
                    </div>
                  ))}
                </div>

                {activeTab === 'search' && nextPageToken && (
                  <div className="text-center mt-5 mb-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="btn btn-lg btn-primary px-5 py-3 rounded-pill shadow-sm"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      {loadingMore ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="me-2">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                          </svg>
                          Load more videos 🎬
                        </>
                      )}
                    </button>
                    <p className="text-muted small mt-3 mb-0">
                      💡 Click to load more videos 
                    </p>
                  </div>
                )}

                {activeTab === 'search' && !nextPageToken && videos.length > 0 && (
                  <div className="text-center mt-5 mb-4">
                    <div className="text-muted">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" className="mb-2">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <p className="mb-0">✨ You’ve watched all videos</p>
                      <small>Try another keyword to discover new videos</small>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <Footer />

      {previewModal.open && (
        <BootstrapModal
          title="Video Preview"
          onClose={() => setPreviewModal({ open: false, videoId: null, videoData: null })}
          videoData={{
            ...previewModal.videoData,
            videoId: previewModal.videoId
          }}
          onFavorite={toggleFavorite}
          isFavorited={favorites.some((f) => f.videoId === previewModal.videoId)}
          isLoggedIn={!!user}
        >
          <div className="ratio ratio-16x9">
            <iframe
              src={`https://www.youtube.com/embed/${previewModal.videoId}?autoplay=1`}
              title="YouTube video preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          {previewModal.videoData && (
            <div className="p-3 bg-light">
              <h5 className="fw-bold mb-2">{previewModal.videoData.title}</h5>
              <p className="text-muted mb-3">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="me-1">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
                {previewModal.videoData.channelTitle}
              </p>

              <div className="d-flex gap-2">
                <button
                  onClick={() => toggleFavorite({
                    videoId: previewModal.videoId,
                    videoData: previewModal.videoData
                  })}
                  className={`btn btn-sm rounded-pill ${
                    favorites.some((f) => f.videoId === previewModal.videoId) 
                      ? 'text-black btn-danger' 
                      : 'text-black btn-outline-danger'
                  }`}
                >
                  {favorites.some((f) => f.videoId === previewModal.videoId) 
                    ? '🤍 Saved' 
                    : '🤍 Save'}
                </button>

                <ShareButton 
                  videoId={previewModal.videoId} 
                  videoTitle={previewModal.videoData.title} 
                />
              </div>
            </div>
          )}
        </BootstrapModal>
      )}
    </div>
  );
}

// ==================== Components ====================

function VideoCard({ video, favorites, onFavorite, onPreview, timeAgo, isLoggedIn }) {
  const videoId = video.videoId || video?.id?.videoId;
  const snippet = video.videoData || video.snippet || {};
  const thumb = snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url;
  const isFavorited = favorites.some((f) => f.videoId === videoId);

  return (
    <div className="card h-100 shadow-sm border-0 video-card">
      <div className="position-relative video-thumbnail">
        <div onClick={() => onPreview(videoId, snippet)} style={{ cursor: 'pointer' }}>
          <img 
            src={thumb} 
            alt={snippet.title} 
            className="card-img-top" 
            style={{ aspectRatio: '16/9', objectFit: 'cover' }} 
          />
          <div className="play-overlay position-absolute top-50 start-50 translate-middle">
            <div className="bg-danger bg-opacity-90 rounded-circle p-3">
              <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite(video);
          }}
          className={`position-absolute btn-danger border-0 btn-sm rounded-circle favorite-btn ${
            isFavorited ? 'btn' : 'btn-outline-danger'
          }`}
          style={{ top: '10px', right: '10px', width: '40px', height: '40px' }}
          title={isLoggedIn ? (isFavorited ? 'Remove from Favorites' : 'Add to Favorites') : 'Log in to save'}
        >
          {isFavorited ? '🤍' : '❤️'}
        </button>
      </div>
      
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold mb-2" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
          {snippet.title?.substring(0, 60)}{snippet.title?.length > 60 ? '...' : ''}
        </h5>
        
        <p className="card-text text-muted small mb-1">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="me-1">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
          {snippet.channelTitle || 'Unknown'}
        </p>
        
        <p className="text-muted small mb-3">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="me-1">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
          {snippet.publishedAt ? timeAgo(snippet.publishedAt) : '...'}
        </p>
      </div>
      
      <style jsx>{`
        .video-card {
          background: #dbdbdbff;
          border: 1px solid black;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .video-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        .video-thumbnail .play-overlay {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .video-card:hover .play-overlay {
          opacity: 1;
        }
        .favorite-btn {
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .favorite-btn:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card shadow-sm border-0">
      <div className="bg-secondary bg-opacity-10" style={{ aspectRatio: '16/9' }}></div>
      <div className="card-body">
        <div className="placeholder-glow">
          <div className="placeholder col-10 mb-2"></div>
          <div className="placeholder col-7 mb-2"></div>
          <div className="placeholder col-6 mb-3"></div>
        </div>
      </div>
    </div>
  );
}

function ShareButton({ videoId, videoTitle }) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handleShare = (platform) => {
    const text = encodeURIComponent(videoTitle || 'Check out this video!');
    const url = encodeURIComponent(videoUrl);
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      line: `https://social-plugins.line.me/lineit/share?url=${url}`,
      copy: videoUrl
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(videoUrl);
      alert('📋 Link copied!');
      setShowShareMenu(false);
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  return (
    <div className="position-relative">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="text-black btn btn-sm btn-outline-primary rounded-pill"
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="me-1">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
        </svg>
        Share
      </button>

      {showShareMenu && (
        <>
          <div 
            className="position-fixed top-0 start-0 w-100 h-100" 
            onClick={() => setShowShareMenu(false)}
            style={{ zIndex: 1055 }}
          />
          <div 
            className="position-absolute bg-white border rounded-3 shadow-lg p-2" 
            style={{ 
              bottom: '110%', 
              left: 0, 
              minWidth: '200px',
              zIndex: 1060
            }}
          >
            <button
              onClick={() => handleShare('facebook')}
              className="text-black btn btn-sm btn-outline-primary w-100 mb-2 text-start"
            >
              <span className="me-2"></span> Facebook
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="text-black btn btn-sm btn-outline-info w-100 mb-2 text-start"
            >
              <span className="me-2"></span> Twitter
            </button>
            <button
              onClick={() => handleShare('line')}
              className="text-black btn btn-sm btn-outline-success w-100 mb-2 text-start"
            >
              <span className="me-2"></span> LINE
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="text-black btn btn-sm btn-outline-secondary w-100 text-start"
            >
              <span className="me-2"></span> Copy Link
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BootstrapModal({ children, title, onClose }) {
  return (
    <>
      <div 
        className="modal-backdrop fade show" 
        onClick={onClose}
        style={{ zIndex: 1040 }}
      ></div>
      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        role="dialog"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}