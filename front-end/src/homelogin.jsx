import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Footer from './components/footer';
import NavHome from './components/navhome';

export default function HomeLogin() {
  const [videos, setVideos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('any');
  const [sortBy, setSortBy] = useState('relevance');
  const [activeTab, setActiveTab] = useState('search');

  // URL
  const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
  const userId = 'demo_user_123';

  const categories = [
    { id: 'all', label: '🌏 ทั้งหมด' }, { id: 'beach', label: '🏖️ ชายหาด' },
    { id: 'mountain', label: '⛰️ ภูเขา' }, { id: 'city', label: '🏙️ เมืองใหญ่' },
    { id: 'temple', label: '🛕 วัดวาอาราม' }, { id: 'food', label: '🍜 อาหาร' },
    { id: 'adventure', label: '🎢 ผจญภัย' }, { id: 'nature', label: '🌿 ธรรมชาติ' },
    { id: 'shopping', label: '🛍️ ช็อปปิ้ง' }
  ];

  const regions = [
       { id: 'all', label: '🌏 ทั่วโลก (ทุกภาษา)' }, 
    { id: 'thailand', label: '🇹🇭 ไทย ' },
    { id: 'japan', label: '🇯🇵 ญุี่ปุ่น ' }, 
    { id: 'korea', label: '🇰🇷 เกาหลี ' },
    { id: 'singapore', label: '🇸🇬 สิงคโปร์ ' }, 
    { id: 'vietnam', label: '🇻🇳 เวียดนาม ' },
    { id: 'indonesia', label: '🇮🇩 อินโดนีเซีย ' }, 
    { id: 'malaysia', label: '🇲🇾 มาเลเซีย ' }
  ];

  // --- Effects ---
  useEffect(() => {
    if (activeTab === 'search') {
      fetchVideos();
    } else {
      fetchFavorites();
    }
  }, [selectedCategory, selectedRegion, selectedDuration, sortBy, activeTab]);

  // --- Helper Functions ---
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
      return then.toLocaleDateString();
    } catch { return ''; }
  };

  // --- API Calls ---
  const fetchVideos = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        query: searchQuery || 'travel guide', category: selectedCategory,
        region: selectedRegion, duration: selectedDuration, sortBy: sortBy, maxResults: 24
      });
      const res = await fetch(`${API_URL}/videos/search?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ API');

      setVideos(json.data || []);
      setCached(Boolean(json.cached));
    } catch (e) {
      console.error(e);
      setError(e.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/videos/favorites/${userId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ API');
      setFavorites(json.data || []);
    } catch (e) {
      console.error(e);
      setError(e.message || 'โหลดรายการโปรดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (video) => {
    const videoId = video.videoId || video?.id?.videoId;
    const snippet = video.videoData || video.snippet;
    const isFav = favorites.some((f) => f.videoId === videoId);

    try {
      if (isFav) {
        setFavorites((prev) => prev.filter((f) => f.videoId !== videoId));
        await fetch(`${API_URL}/videos/favorite/${userId}/${videoId}`, { method: 'DELETE' });
        showToast('ลบออกจากรายการโปรดแล้ว');
      } else {
        setFavorites((prev) => [{ userId, videoId, videoData: snippet }, ...prev]);
        await fetch(`${API_URL}/videos/favorite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, videoId, videoData: snippet }),
        });
        showToast('บันทึกเป็นรายการโปรดแล้ว');
      }
    } catch (e) {
      console.error(e);
      fetchFavorites(); // Rollback
      showToast('เกิดข้อผิดพลาดกับรายการโปรด');
    }
  };

  const submitReview = async ({ video, rating, comment }) => {
    const videoId = video.videoId || video?.id?.videoId;
    const snippet = video.videoData || video.snippet;
    try {
      await fetch(`${API_URL}/videos/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, videoId, rating, comment, videoData: snippet }),
      });
      showToast('บันทึกรีวิวเรียบร้อย');
    } catch (e) {
      console.error(e);
      showToast('บันทึกรีวิวไม่สำเร็จ');
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    if (activeTab !== 'search') setActiveTab('search');
    fetchVideos();
  };

  const listToRender = activeTab === 'search' ? videos : favorites;

  // --- Modals State ---
  const [ratingModal, setRatingModal] = useState({ open: false, video: null });
  const [previewModal, setPreviewModal] = useState({ open: false, videoId: null });

  return (
    <div className="min-h-screen bg-light">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-dark text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}

      {/* Header (Converted to Bootstrap) */}
      <NavHome/>

      <header className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white pt-5 pb-12">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="text-black text-3xl md:text-4xl fw-bold">🌏 Travel Video Guide</h1>
            <div className="d-flex gap-2">
              <button onClick={() => setActiveTab('search')} className={`btn ${activeTab === 'search' ? 'btn-light' : 'btn-outline-light'}`}>
                🔍 ค้นหา
              </button>
              <button onClick={() => setActiveTab('favorites')} className={`btn ${activeTab === 'favorites' ? 'btn-light' : 'btn-outline-light'}`}>
                ❤️ ถูกใจ ({favorites.length})
              </button>
            </div>
          </div>

          {activeTab === 'search' && (
            <form onSubmit={handleSearch} className="max-w-3xl">
              <div className="input-group mb-2 bg-white rounded-xl shadow-lg p-1">
                <span className="input-group-text bg-transparent border-0 text-dark opacity-60">🔎</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาสถานที่/คีย์เวิร์ด เช่น Japan food street..."
                  className="form-control border-0 py-2 focus:shadow-none"
                />
                <button type="submit" className="btn btn-warning fw-bold px-4">ค้นหา</button>
              </div>
              {cached && (
                <div className="mt-2 text-sm text-white/90">📦 แสดงผลจากแคช</div>
              )}
            </form>
          )}
        </div>
      </header>

      {/* Filters (Converted to Bootstrap) */}
      {activeTab === 'search' && (
        <div className="bg-white shadow-sm border-bottom py-3">
          <div className="container">
            <div className="mb-3">
              <div className="d-flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`btn btn-sm rounded-pill ${
                      selectedCategory === cat.id ? 'btn-primary text-white' : 'btn-light text-dark'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="form-select"
                >
                  {regions.map((r) => (<option key={r.id} value={r.id}>🗺️ {r.label}</option>))}
                </select>
              </div>

              <div className="col-md-4">
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="form-select"
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
                  className="form-select"
                >
                  <option value="relevance">📊 เกี่ยวข้องมากสุด</option>
                  <option value="date">🆕 ล่าสุด</option>
                  <option value="viewCount">👁️ ยอดวิวสูงสุด</option>
                  <option value="rating">⭐ คะแนนสูงสุด</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="container py-5">
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            ❗ {error}
          </div>
        )}

        {loading ? (
          <div className="row g-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCardKey key={i} />
            ))}
          </div>
        ) : (
          <>
            <h2 className="text-2xl fw-bold mb-4">
              {activeTab === 'search' ? `พบ ${videos.length} วิดีโอ` : `รายการโปรดของคุณ (${favorites.length})`}
            </h2>

            <div className="row g-4">
              {listToRender.map((video, idx) => (
                <div key={video.id?.videoId || video.videoId || idx} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <VideoCard
                    video={video}
                    favorites={favorites}
                    onFavorite={toggleFavorite}
                    onPreview={(id) => setPreviewModal({ open: true, videoId: id })}
                    onOpenReview={() => setRatingModal({ open: true, video })}
                    timeAgo={timeAgo}
                  />
                </div>
              ))}
            </div>

            {listToRender.length === 0 && !loading && (
              <div className="text-center py-5">
                <p className="text-secondary text-lg">
                  {activeTab === 'search'
                    ? '😔 ไม่พบวิดีโอที่ตรงกับการค้นหา'
                    : '❤️ ยังไม่มีรายการโปรด'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <Footer/>

      {/* Bootstrap Modals (Simplified Component usage) */}
      {previewModal.open && (
        <BootstrapModal
          title="Video Preview"
          onClose={() => setPreviewModal({ open: false, videoId: null })}
        >
          <div className="ratio ratio-16x9">
              <iframe
                className="embed-responsive-item"
                src={`https://www.youtube.com/embed/${previewModal.videoId}`}
                title="YouTube video preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
          </div>
        </BootstrapModal>
      )}

      {ratingModal.open && (
        <BootstrapModal
          title="ให้คะแนนและรีวิว"
          onClose={() => setRatingModal({ open: false, video: null })}
        >
          <RatingForm
            onSubmit={(payload) => {
              submitReview({ ...payload, video: ratingModal.video });
              setRatingModal({ open: false, video: null });
            }}
            onCancel={() => setRatingModal({ open: false, video: null })}
          />
        </BootstrapModal>
      )}
    </div>
  );
}


// --- Bootstrap Components (Since we removed custom Tailwind components) ---

// VideoCard Adjusted for Bootstrap structure (Card component)
function VideoCard({ video, favorites, onFavorite, onPreview, onOpenReview, timeAgo }) {
  const videoId = video.videoId || video?.id?.videoId;
  const snippet = video.videoData || video.snippet || {};
  const thumb = snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url;
  const isFavorited = favorites.some((f) => f.videoId === videoId);

  return (
    <div className="col-12"> {/* Individual card item in the row */}
      <div className="card h-100 shadow-sm border-0">
        <div className="position-relative">
          <button onClick={() => onPreview(videoId)} className="btn p-0 w-100">
            <img src={thumb} alt={snippet.title} className="card-img-top" style={{ aspectRatio: '16/9', objectFit: 'cover' }} />
          </button>
          
          <button
            onClick={(e) => { e.preventDefault(); onFavorite(video); }}
            className={`position-absolute top-2 end-2 btn btn-sm rounded-circle ${isFavorited ? 'btn-danger' : 'btn-outline-light text-danger'}`}
            title={isFavorited ? 'ลบรายการโปรด' : 'เพิ่มรายการโปรด'}
          >
            <svg className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>
        
        <div className="card-body d-flex flex-column">
          <h5 className="card-title mb-2 text-dark" title={snippet.title}>
            {snippet.title.substring(0, 60)}...
          </h5>
          <p className="card-text text-muted small mb-1">
            👤 {snippet.channelTitle || 'Unknown Channel'}
          </p>
          <p className="text-muted small mb-3">
            {snippet.publishedAt ? timeAgo(snippet.publishedAt) : '...'}
          </p>
          
          <div className="mt-auto d-flex gap-2">
            <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary flex-grow">
              เปิดบน YouTube
            </a>
            <button onClick={onOpenReview} className="btn btn-sm btn-outline-secondary">
              ⭐ รีวิว
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCardKey({ key }) {
  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
      <div className="card shadow-sm border-0">
        <div className="card-img-top bg-light" style={{ aspectRatio: '16/9' }}></div>
        <div className="card-body">
          <div className="placeholder-glow">
            <div className="placeholder col-8 mb-2"></div>
            <div className="placeholder col-5 mb-2"></div>
            <div className="placeholder col-12 mb-3"></div>
            <div className="d-flex gap-2 mt-auto">
                <div className="placeholder col-6 h-8"></div>
                <div className="placeholder col-4 h-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bootstrap Modal Wrapper
function BootstrapModal({ children, title, onClose }) {
  return (
    <div className="modal show d-block" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.6)' }} role="dialog">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Rating Form (Bootstrap Style)
function RatingForm({ onSubmit, onCancel }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  return (
    <div className="p-3">
      <div className="d-flex align-items-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)} className="btn btn-sm p-0 fs-4 border-0 bg-transparent">
            {i <= (hover || rating) ? '⭐' : '☆'}
          </button>
        ))}
        <span className="text-muted ms-2">({rating}/5)</span>
      </div>
      <textarea
        className="form-control mb-3"
        placeholder="เขียนความเห็น (ไม่จำเป็น)"
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="d-flex justify-content-end gap-2">
        <button onClick={onCancel} className="btn btn-light">ยกเลิก</button>
        <button onClick={() => onSubmit({ rating, comment })} className="btn btn-primary">บันทึกรีวิว</button>
      </div>
    </div>
  );
}