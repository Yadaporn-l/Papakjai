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
  const [hasMore, setHasMore] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('any');
  const [sortBy, setSortBy] = useState('relevance');
  const [activeTab, setActiveTab] = useState('search');
  const [previewModal, setPreviewModal] = useState({ open: false, videoId: null });

  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
  const userId = user?.uid || null;

  useEffect(() => {
    if (!user) {
      console.log('User not logged in');
    }
  }, [user]);

  const categories = [
    { id: 'all', label: '🌏 ทั้งหมด' }, 
    { id: 'beach', label: '🏖️ ชายหาด' },
    { id: 'mountain', label: '⛰️ ภูเขา' }, 
    { id: 'city', label: '🏙️ เมืองใหญ่' },
    { id: 'temple', label: '🛕 วัดวาอาราม' }, 
    { id: 'food', label: '🍜 อาหาร' },
    { id: 'adventure', label: '🎢 ผจญภัย' }, 
    { id: 'nature', label: '🌿 ธรรมชาติ' },
    { id: 'shopping', label: '🛍️ ช็อปปิ้ง' }
  ];

  const regions = [
    { id: 'all', label: '🌏 ทั่วโลก' }, 
    { id: 'thailand', label: '🇹🇭 ไทย' },
    { id: 'japan', label: '🇯🇵 ญี่ปุ่น' }, 
    { id: 'korea', label: '🇰🇷 เกาหลี' },
    { id: 'singapore', label: '🇸🇬 สิงคโปร์' }, 
    { id: 'vietnam', label: '🇻🇳 เวียดนาม' },
    { id: 'indonesia', label: '🇮🇩 อินโดนีเซีย' }, 
    { id: 'malaysia', label: '🇲🇾 มาเลเซีย' }
  ];

  useEffect(() => {
    if (activeTab === 'search') {
      fetchVideos();
    } else {
      fetchFavorites();
    }
  }, [selectedCategory, selectedRegion, selectedDuration, sortBy, activeTab]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const timeAgo = (iso) => {
    try {
      const then = new Date(iso);
      const diff = (Date.now() - then.getTime()) / 1000;
      if (diff < 60) return 'เมื่อสักครู่';
      if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
      if (diff < 2592000) return `${Math.floor(diff / 86400)} วันที่แล้ว`;
      return then.toLocaleDateString('th-TH');
    } catch { return ''; }
  };

  const fetchVideos = async (pageToken = null) => {
    if (pageToken) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setVideos([]);
      setNextPageToken(null);
      setHasMore(true);
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
      
      if (pageToken) {
        params.append('pageToken', pageToken);
      }
      
      const res = await fetch(`${API_URL}/videos/search?${params}`);
      const json = await res.json();
      
      if (!json.success) throw new Error(json.error || 'เกิดข้อผิดพลาด');
      
      if (pageToken) {
        setVideos(prev => [...prev, ...(json.data || [])]);
      } else {
        setVideos(json.data || []);
      }
      
      setNextPageToken(json.nextPageToken || null);
      setHasMore(Boolean(json.nextPageToken));
      setCached(Boolean(json.cached));
    } catch (e) {
      console.error(e);
      setError(e.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
      
      if (!json.success) throw new Error(json.error || 'เกิดข้อผิดพลาด');
      
      setFavorites(json.data || []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'โหลดรายการโปรดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (video) => {
    if (!userId) {
      showToast('⚠️ กรุณาเข้าสู่ระบบก่อนใช้งานรายการโปรด');
      return;
    }
    
    const videoId = video.videoId || video?.id?.videoId;
    const snippet = video.videoData || video.snippet;
    const isFav = favorites.some((f) => f.videoId === videoId);

    if (isFav) {
      setFavorites((prev) => prev.filter((f) => f.videoId !== videoId));
      showToast('❤️ ลบออกจากรายการโปรดแล้ว');
    } else {
      setFavorites((prev) => [{ userId, videoId, videoData: snippet, createdAt: new Date() }, ...prev]);
      showToast('❤️ เพิ่มเข้ารายการโปรดแล้ว');
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
      showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    if (activeTab !== 'search') setActiveTab('search');
    fetchVideos();
  };

  const handleLoadMore = () => {
    if (nextPageToken && !loadingMore) {
      fetchVideos(nextPageToken);
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
              <p className="mb-0 opacity-90">ค้นพบสถานที่ท่องเที่ยวผ่านคลิปวิดีโอคุณภาพสูง</p>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              {user && (
                <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-pill px-3 py-2">
                  <div 
                    className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="User" 
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px' }}
                      />
                    ) : (
                      <span className="text-primary fw-bold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <span className="text-black small d-none d-md-inline">
                    {user.displayName || user.email}
                  </span>
                  <button 
                    onClick={() => {
                      if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                        logOut();
                        navigate('/login');
                      }
                    }}
                    className="btn btn-sm btn-outline-light rounded-pill"
                    title="ออกจากระบบ"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="d-flex gap-2">
                <button 
                  onClick={() => setActiveTab('search')} 
                  className={`btn ${activeTab === 'search' ? 'text-black btn-light' : 'btn-outline-light'}`}
                >
                  🔍 ค้นหา
                </button>
                <button 
                  onClick={() => {
                    if (!user) {
                      showToast('⚠️ กรุณาเข้าสู่ระบบก่อนใช้งานรายการโปรด');
                      return;
                    }
                    setActiveTab('favorites');
                  }}
                  className={`btn ${activeTab === 'favorites' ? 'btn-light text-black' : 'btn-outline-light text-black'} position-relative`}
                  disabled={!user}
                >
                  ❤️ รายการโปรด
                  {favorites.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-white">
                      {favorites.length}
                    </span>
                  )}
                </button>
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
                      placeholder="ค้นหาสถานที่ท่องเที่ยว เช่น Japan, Bali, Street Food..."
                      className="form-control border-0 shadow-none"
                    />
                    <button 
                      type="button" 
                      onClick={handleSearch} 
                      className="btn btn-warning fw-bold px-4"
                    >
                      ค้นหา
                    </button>
                  </div>
                </div>
                {cached && (
                  <div className="mt-2 text-center">
                    <small className="text-white opacity-75">📦 แสดงผลจากแคช</small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {activeTab === 'search' && (
        <div className="bg-white border-bottom shadow-sm py-3 sticky-top" style={{ top: 0, zIndex: 1020 }}>
          <div className="container">
            <div className="mb-3 overflow-auto">
              <div className="d-flex gap-2 pb-2" style={{ flexWrap: 'nowrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`btn btn-sm rounded-pill flex-shrink-0 ${
                      selectedCategory === cat.id ? 'btn-primary' : 'btn-outline-secondary'
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
                  <option value="any">⏱️ ทุกความยาว</option>
                  <option value="short">สั้น (&lt; 4 นาที)</option>
                  <option value="medium">ปานกลาง (4-20 นาที)</option>
                  <option value="long">ยาว (&gt; 20 นาที)</option>
                </select>
              </div>

              <div className="col-md-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select form-select-sm"
                >
                  <option value="relevance">📊 เกี่ยวข้องมากสุด</option>
                  <option value="date">🆕 ล่าสุด</option>
                  <option value="viewCount">👁️ ยอดวิวสูงสุด</option>
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
            <h2 className="h4 mb-4">กำลังโหลด...</h2>
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
              <h2 className="h4 mb-0">
                {activeTab === 'search' 
                  ? `พบ ${videos.length}${hasMore ? '+' : ''} วิดีโอ` 
                  : `รายการโปรดของคุณ (${favorites.length})`
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
                    ? 'ไม่พบวิดีโอที่ตรงกับการค้นหา'
                    : 'ยังไม่มีรายการโปรด'
                  }
                </h3>
                <p className="text-muted">
                  {activeTab === 'search'
                    ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่'
                    : 'กดปุ่ม ❤️ เพื่อเพิ่มวิดีโอที่คุณชอบ'
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
                        onPreview={(id) => setPreviewModal({ open: true, videoId: id })}
                        timeAgo={timeAgo}
                      />
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {activeTab === 'search' && hasMore && (
                  <div className="text-center mt-5">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-sm"
                    >
                      {loadingMore ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          กำลังโหลด...
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="me-2">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                          โหลดเพิ่มเติม
                        </>
                      )}
                    </button>
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
          title="ดูตัวอย่างวิดีโอ"
          onClose={() => setPreviewModal({ open: false, videoId: null })}
        >
          <div className="ratio ratio-16x9">
            <iframe
              src={`https://www.youtube.com/embed/${previewModal.videoId}?autoplay=1`}
              title="YouTube video preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </BootstrapModal>
      )}
    </div>
  );
}

function VideoCard({ video, favorites, onFavorite, onPreview, timeAgo }) {
  const videoId = video.videoId || video?.id?.videoId;
  const snippet = video.videoData || video.snippet || {};
  const thumb = snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url;
  const isFavorited = favorites.some((f) => f.videoId === videoId);

  return (
    <div className="card h-100 shadow-sm border-0 video-card">
      <div className="position-relative video-thumbnail">
        <div onClick={() => onPreview(videoId)} style={{ cursor: 'pointer' }}>
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
          className={`position-absolute btn btn-sm rounded-circle favorite-btn ${
            isFavorited ? 'btn-danger' : 'btn-light'
          }`}
          style={{ top: '10px', right: '10px', width: '40px', height: '40px' }}
        >
          {isFavorited ? '❤️' : '🤍'}
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
          background: pink;
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