// server.js - Backend API with Firebase, Pagination and Multi-Language Support
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Check YouTube API Key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.error('❌ Error: YOUTUBE_API_KEY is required in environment variables');
  process.exit(1);
}

// Check Service Account file
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: Service account file not found at:', serviceAccountPath);
  console.error('Please download service account key from Firebase Console');
  process.exit(1);
}

var serviceAccount = require(serviceAccountPath);

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ============================================
// 1. API: Search Videos with Cache and Pagination
// ============================================
app.get('/api/videos/search', async (req, res) => {
  try {
    const { 
      query = 'travel guide', 
      category = 'all',
      region = 'all', 
      duration = 'any',
      sortBy = 'relevance',
      maxResults = 24,
      pageToken = null
    } = req.query;

    // สร้าง cache key (ไม่รวม pageToken)
    const cacheKey = `${query}_${category}_${region}_${duration}_${sortBy}`;
    
    // 1. เช็ค Cache ใน Firebase (เฉพาะหน้าแรก)
    if (!pageToken) {
      const cacheRef = db.collection('videoCache').doc(cacheKey);
      const cacheDoc = await cacheRef.get();
      
      if (cacheDoc.exists) {
        const cacheData = cacheDoc.data();
        const now = Date.now();
        const cacheAge = now - cacheData.timestamp;
        
        if (cacheAge < 24 * 60 * 60 * 1000) { // 24 hours
          console.log('📦 Returning cached data (first page)');
          return res.json({
            success: true,
            data: cacheData.videos,
            nextPageToken: cacheData.nextPageToken,
            cached: true,
            timestamp: cacheData.timestamp
          });
        }
      }
    }

    // 2. ดึงข้อมูลจาก YouTube API
    console.log(`🔍 Fetching from YouTube API... ${pageToken ? '(Next Page)' : '(First Page)'}`);
    const searchQuery = buildSearchQuery(query, category, region);
    
    const params = {
      part: 'snippet',
      maxResults: maxResults,
      q: searchQuery,
      type: 'video',
      order: sortBy,
      videoDuration: duration,
      relevanceLanguage: getRelevanceLanguage(region), // ✅ เพิ่มภาษาที่เกี่ยวข้อง
      key: YOUTUBE_API_KEY
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams(params)}`;
    const response = await axios.get(youtubeUrl);

    // 3. บันทึก Cache ลง Firebase (เฉพาะหน้าแรก)
    if (!pageToken) {
      const cacheRef = db.collection('videoCache').doc(cacheKey);
      await cacheRef.set({
        videos: response.data.items,
        nextPageToken: response.data.nextPageToken || null,
        timestamp: Date.now(),
        query: searchQuery,
        filters: { category, region, duration, sortBy }
      });

      // 4. บันทึก Search History
      await db.collection('searchHistory').add({
        query: searchQuery,
        filters: { category, region, duration, sortBy },
        resultCount: response.data.items.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({
      success: true,
      data: response.data.items,
      nextPageToken: response.data.nextPageToken || null,
      cached: false
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 2. API: Save Favorite Video
// ============================================
app.post('/api/videos/favorite', async (req, res) => {
  try {
    const { userId, videoId, videoData } = req.body;

    if (!userId || !videoId) {
      return res.status(400).json({
        success: false,
        error: 'userId and videoId are required'
      });
    }

    await db.collection('favorites').doc(`${userId}_${videoId}`).set({
      userId,
      videoId,
      videoData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Video saved to favorites'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 3. API: Get User's Favorites
// ============================================
app.get('/api/videos/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const snapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .get();
    
    const favorites = [];
    snapshot.forEach(doc => {
      favorites.push({ id: doc.id, ...doc.data() });
    });

    favorites.sort((a, b) => {
      const timeA = a.createdAt?._seconds || a.createdAt?.seconds || 0;
      const timeB = b.createdAt?._seconds || b.createdAt?.seconds || 0;
      return timeB - timeA;
    });

    res.json({
      success: true,
      data: favorites
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 4. API: Remove Favorite
// ============================================
app.delete('/api/videos/favorite/:userId/:videoId', async (req, res) => {
  try {
    const { userId, videoId } = req.params;

    await db.collection('favorites').doc(`${userId}_${videoId}`).delete();

    res.json({
      success: true,
      message: 'Favorite removed'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 5. API: Get Popular Videos (Analytics)
// ============================================
app.get('/api/videos/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const snapshot = await db.collection('favorites').get();
    
    const videoCount = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const videoId = data.videoId;
      
      if (!videoCount[videoId]) {
        videoCount[videoId] = {
          count: 0,
          videoData: data.videoData
        };
      }
      videoCount[videoId].count++;
    });

    const popularVideos = Object.entries(videoCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, parseInt(limit))
      .map(([videoId, data]) => ({
        videoId,
        favoriteCount: data.count,
        videoData: data.videoData
      }));

    res.json({
      success: true,
      data: popularVideos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 6. API: Save User Review/Rating
// ============================================
app.post('/api/videos/review', async (req, res) => {
  try {
    const { userId, videoId, rating, comment, videoData } = req.body;

    if (!userId || !videoId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'userId, videoId, and rating are required'
      });
    }

    await db.collection('reviews').add({
      userId,
      videoId,
      rating,
      comment: comment || '',
      videoData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Review saved'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 7. API: Get Video Reviews
// ============================================
app.get('/api/videos/reviews/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const snapshot = await db.collection('reviews')
      .where('videoId', '==', videoId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = [];
    let totalRating = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      reviews.push({ id: doc.id, ...data });
      totalRating += data.rating;
    });

    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: avgRating,
        totalReviews: reviews.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// 8. API: Get Video Comments from YouTube
// ============================================
app.get('/api/videos/comments/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
      params: {
        part: 'snippet',
        videoId: videoId,
        maxResults: 20,
        order: 'relevance',
        key: YOUTUBE_API_KEY
      }
    });

    const comments = response.data.items.map(item => ({
      authorDisplayName: item.snippet.topLevelComment.snippet.authorDisplayName,
      authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
      textDisplay: item.snippet.topLevelComment.snippet.textDisplay,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt
    }));

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.json({ success: true, data: [] });
  }
});

// ============================================
// Helper Functions
// ============================================

// ✅ ฟังก์ชันกำหนดภาษาสำหรับ YouTube API
function getRelevanceLanguage(region) {
  const languageMap = {
    thailand: 'th',      // ภาษาไทย
    japan: 'ja',         // ภาษาญี่ปุ่น
    korea: 'ko',         // ภาษาเกาหลี
    china: 'zh',         // ภาษาจีน
    vietnam: 'vi',       // ภาษาเวียดนาม
    indonesia: 'id',     // ภาษาอินโดนีเซีย
    malaysia: 'ms',      // ภาษามาเลย์
    singapore: 'en',     // ภาษาอังกฤษ
    philippines: 'tl',   // ภาษาฟิลิปปินส์
    india: 'hi',         // ภาษาฮินดี
    france: 'fr',        // ภาษาฝรั่งเศส
    germany: 'de',       // ภาษาเยอรมัน
    italy: 'it',         // ภาษาอิตาลี
    spain: 'es',         // ภาษาสเปน
    usa: 'en',           // ภาษาอังกฤษ
    uk: 'en',            // ภาษาอังกฤษ
    australia: 'en',     // ภาษาอังกฤษ
    all: ''              // ไม่จำกัดภาษา
  };
  
  return languageMap[region] || '';
}

function buildSearchQuery(query, category, region) {
  let mandatoryKeywords = [];
  
  // ✅ คำค้นหาพื้นฐานตามภาษาของประเทศ
  const baseKeywords = {
    thailand: 'เที่ยว ท่องเที่ยว รีวิว',
    japan: '旅行 観光 ガイド',
    korea: '여행 관광 가이드',
    china: '旅游 旅行 攻略',
    vietnam: 'du lịch khám phá',
    indonesia: 'wisata traveling jalan-jalan',
    malaysia: 'travel melancong',
    singapore: 'travel guide vlog',
    philippines: 'travel tour biyahe',
    india: 'travel yatra guide',
    france: 'voyage tourisme guide',
    germany: 'reisen urlaub guide',
    italy: 'viaggi turismo guida',
    spain: 'viajes turismo guía',
    usa: 'travel tour guide',
    uk: 'travel holiday guide',
    australia: 'travel guide aussie',
    all: 'travel trip guide'
  };

  if (region !== 'all' && baseKeywords[region]) {
    mandatoryKeywords.push(baseKeywords[region]);
  } else {
    mandatoryKeywords.push('travel trip guide review');
  }

  // ✅ หมวดหมู่ตามภาษา
  const categoryQueries = {
    beach: {
      thailand: 'หาด ทะเล',
      japan: 'ビーチ 海',
      korea: '해변 바다',
      china: '海滩 沙滩',
      default: 'beach resort sea'
    },
    mountain: {
      thailand: 'ภูเขา เดินป่า',
      japan: '山 登山',
      korea: '산 등산',
      china: '山 登山',
      default: 'mountain hiking'
    },
    city: {
      thailand: 'เมือง เที่ยวเมือง',
      japan: '都市 街',
      korea: '도시 시내',
      china: '城市 市区',
      default: 'city tour urban'
    },
    temple: {
      thailand: 'วัด ศาลเจ้า',
      japan: '寺 神社',
      korea: '사찰 절',
      china: '寺庙 古迹',
      default: 'temple shrine'
    },
    food: {
      thailand: 'อาหาร กิน ร้านอาหาร',
      japan: '食べ物 グルメ',
      korea: '음식 맛집',
      china: '美食 小吃',
      default: 'food street food restaurant'
    },
    adventure: {
      thailand: 'ผจญภัย กิจกรรม',
      japan: 'アドベンチャー',
      korea: '모험 액티비티',
      china: '冒险 活动',
      default: 'adventure activities'
    },
    nature: {
      thailand: 'ธรรมชาติ น้ำตก',
      japan: '自然 公園',
      korea: '자연 공원',
      china: '自然 公园',
      default: 'nature park waterfall'
    },
    shopping: {
      thailand: 'ช็อปปิ้ง ตลาด ห้าง',
      japan: 'ショッピング 市場',
      korea: '쇼핑 시장',
      china: '购物 市场',
      default: 'shopping market mall'
    }
  };
  
  if (category !== 'all' && categoryQueries[category]) {
    const catQuery = categoryQueries[category];
    if (region !== 'all' && catQuery[region]) {
      mandatoryKeywords.push(catQuery[region]);
    } else {
      mandatoryKeywords.push(catQuery.default);
    }
  }

  // ✅ ชื่อประเทศในภาษาท้องถิ่น
  const regionNames = {
    thailand: 'ประเทศไทย thailand',
    japan: '日本 japan',
    korea: '한국 대한민국 korea',
    china: '中国 china',
    vietnam: 'việt nam vietnam',
    indonesia: 'indonesia',
    malaysia: 'malaysia',
    singapore: 'singapore',
    philippines: 'pilipinas philippines',
    india: 'भारत india',
    france: 'france',
    germany: 'deutschland germany',
    italy: 'italia italy',
    spain: 'españa spain',
    usa: 'usa america',
    uk: 'uk england britain',
    australia: 'australia'
  };
  
  if (region !== 'all' && regionNames[region]) {
    mandatoryKeywords.push(regionNames[region]);
  }
  
  let finalQuery = query.trim();

  if (!finalQuery) {
    finalQuery = 'Travel Guide';
  }
  
  const additionalTerms = mandatoryKeywords.join(' ');
  const finalSearchString = `${finalQuery} ${additionalTerms}`;

  console.log(`🔍 Final YouTube Query: ${finalSearchString}`);
  console.log(`🌐 Language: ${getRelevanceLanguage(region) || 'All'}`);
  
  return finalSearchString;
}

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;