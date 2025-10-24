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
  const [loadingMore, setLoadingMore] = useState(false); // ✅ loading สำหรับปุ่ม "ดูเพิ่มเติม"
  const [cached, setCached] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [nextPageToken, setNextPageToken] = useState(null); // ✅ เก็บ token หน้าถัดไป

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

  useEffect(() => {
    if (!user) {
      console.log('User not logged in');
    }
  }, [user]);

  // ✅ Logout เมื่อปิดหน้าเว็บ
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        logOut();
      }
    };

    // ฟังการปิดหน้าเว็บ
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, logOut]);

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
      fetchVideos(true); // true = reset (เริ่มต้นใหม่)
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

  // ✅ ปรับปรุง fetchVideos ให้รองรับ pagination
  const fetchVideos = async (reset = false) => {
    const isLoadingMore = !reset;
    
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setVideos([]); // ล้างวิดีโอเก่าถ้า reset
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

      // ✅ ถ้าโหลดเพิ่ม ให้ส่ง pageToken ไปด้วย
      if (isLoadingMore && nextPageToken) {
        params.append('pageToken', nextPageToken);
      }

      const res = await fetch(`${API_URL}/videos/search?${params}`);
      const json = await res.json();
      
      if (!json.success) throw new Error(json.error || 'เกิดข้อผิดพลาด');
      
      // ✅ ถ้าโหลดเพิ่ม ให้เพิ่มวิดีโอเข้าไปในรายการเดิม
      if (isLoadingMore) {
        setVideos(prev => [...prev, ...(json.data || [])]);
      } else {
        setVideos(json.data || []);
      }
      
      setNextPageToken(json.nextPageToken || null); // ✅ เก็บ token หน้าถัดไป
      setCached(Boolean(json.cached));
      
    } catch (e) {
      console.error(e);
      setError(e.message || 'โหลดข้อมูลไม่สำเร็จ');
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
    fetchVideos(true); // true = reset
  };

  // ✅ ฟังก์ชันโหลดเพิ่ม
  const handleLoadMore = () => {
    if (nextPageToken && !loadingMore) {
      fetchVideos(false); // false = load more
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
                   
                  </div>
  
                  
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
                      selectedCategory === cat.id ? 'btn-primary text-black' : 'btn-primary text-black'
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
                  <option value="short">สั้น (&lt; 4 นาทื)</option>
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
                  ? `พบ ${videos.length}${nextPageToken ? '+' : ''} วิดีโอ` 
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
                      onPreview={(id, data) => setPreviewModal({ open: true, videoId: id, videoData: data })}
                      timeAgo={timeAgo}
                    />
                    </div>
                  ))}
                </div>

                {/* ✅ ปุ่มดูเพิ่มเติม - แสดงเฉพาะใน Search Tab และมี nextPageToken */}
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
                          กำลังโหลด...
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="me-2">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                          </svg>
                          ดูวิดีโอเพิ่มเติม 🎬
                        </>
                      )}
                    </button>
                    <p className="text-muted small mt-3 mb-0">
                      💡 คลิกเพื่อโหลดวิดีโอเพิ่มอีก 24 คลิป
                    </p>
                  </div>
                )}

                {/* ✅ แสดงข้อความเมื่อไม่มีวิดีโอเพิ่ม */}
                {activeTab === 'search' && !nextPageToken && videos.length > 0 && (
                  <div className="text-center mt-5 mb-4">
                    <div className="text-muted">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20" className="mb-2">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <p className="mb-0">✨ คุณได้ดูวิดีโอทั้งหมดแล้ว</p>
                      <small>ลองค้นหาด้วยคำค้นหาอื่นเพื่อดูวิดีโอใหม่ๆ</small>
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
    title="ดูตัวอย่างวิดีโอ"
    onClose={() => setPreviewModal({ open: false, videoId: null, videoData: null })}
    videoData={{
      ...previewModal.videoData,
      videoId: previewModal.videoId
    }}
    onFavorite={toggleFavorite}
    isFavorited={favorites.some((f) => f.videoId === previewModal.videoId)}
  >
    <div className="ratio ratio-16x9">
      <iframe
        src={`https://www.youtube.com/embed/${previewModal.videoId}?autoplay=1`}
        title="YouTube video preview"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
    
    {/* แสดงข้อมูลใต้วิดีโอพร้อมปุ่ม */}
    {previewModal.videoData && (
      <div className="p-3 bg-light">
        <h5 className="fw-bold mb-2">{previewModal.videoData.title}</h5>
        <p className="text-muted mb-3">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="me-1">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
          {previewModal.videoData.channelTitle}
        </p>

        {/* ปุ่มบันทึกและแชร์ */}
        <div className="d-flex gap-2">
          <button
            onClick={() => toggleFavorite({
              videoId: previewModal.videoId,
              videoData: previewModal.videoData
            })}
            className={`btn btn-sm rounded-pill ${
              favorites.some((f) => f.videoId === previewModal.videoId) 
                ? 'btn-danger' 
                : 'btn-outline-danger'
            }`}
          >
            {favorites.some((f) => f.videoId === previewModal.videoId) 
              ? '❤️ บันทึกแล้ว' 
              : '🤍 บันทึก'}
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

function VideoCard({ video, favorites, onFavorite, onPreview, timeAgo }) {
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
          className={`position-absolute btn btn-sm rounded-circle favorite-btn ${
            isFavorited ? 'btn-danger' : 'btn-primary text-black'
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
      alert('📋 คัดลอกลิงก์แล้ว!');
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
        className="btn btn-sm btn-outline-primary rounded-pill"
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="me-1">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
        </svg>
        แชร์
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
              className="btn btn-sm btn-outline-primary w-100 mb-2 text-start"
            >
              <span className="me-2">📘</span> Facebook
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="btn btn-sm btn-outline-info w-100 mb-2 text-start"
            >
              <span className="me-2">🐦</span> Twitter
            </button>
            <button
              onClick={() => handleShare('line')}
              className="btn btn-sm btn-outline-success w-100 mb-2 text-start"
            >
              <span className="me-2">💬</span> LINE
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="btn btn-sm btn-outline-secondary w-100 text-start"
            >
              <span className="me-2">📋</span> คัดลอกลิงก์
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