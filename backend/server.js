// server.js - Backend API with Firebase and Pagination
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.error('❌ Error: YOUTUBE_API_KEY is required in environment variables');
  process.exit(1);
}

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: Service account file not found at:', serviceAccountPath);
  console.error('Please download service account key from Firebase Console');
  process.exit(1);
}

var serviceAccount = require(serviceAccountPath);

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ============================================
// 1. API: Search Videos with Cache & Pagination
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
      pageToken = null  // ✅ รับ pageToken สำหรับ pagination
    } = req.query;

    // ถ้ามี pageToken = ไม่ใช้ cache (เพราะเป็นการโหลดหน้าถัดไป)
    if (!pageToken) {
      const cacheKey = `${query}_${category}_${region}_${duration}_${sortBy}`;
      const cacheRef = db.collection('videoCache').doc(cacheKey);
      const cacheDoc = await cacheRef.get();
      
      if (cacheDoc.exists) {
        const cacheData = cacheDoc.data();
        const now = Date.now();
        const cacheAge = now - cacheData.timestamp;
        
        if (cacheAge < 24 * 60 * 60 * 1000) {
          console.log('📦 Returning cached data');
          return res.json({
            success: true,
            data: cacheData.videos,
            nextPageToken: cacheData.nextPageToken || null,
            cached: true,
            timestamp: cacheData.timestamp
          });
        }
      }
    }

    // ดึงข้อมูลจาก YouTube API
    console.log('🔍 Fetching from YouTube API...');
    const searchQuery = buildSearchQuery(query, category, region);
    
    const params = new URLSearchParams({
      part: 'snippet',
      maxResults: maxResults,
      q: searchQuery,
      type: 'video',
      order: sortBy,
      videoDuration: duration,
      key: YOUTUBE_API_KEY
    });

    // ✅ เพิ่ม pageToken ถ้ามี
    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?${params}`;
    const response = await axios.get(youtubeUrl);

    const videos = response.data.items || [];
    const nextPageToken = response.data.nextPageToken || null;

    // บันทึก Cache เฉพาะหน้าแรก (ไม่มี pageToken)
    if (!pageToken) {
      const cacheKey = `${query}_${category}_${region}_${duration}_${sortBy}`;
      await db.collection('videoCache').doc(cacheKey).set({
        videos: videos,
        nextPageToken: nextPageToken,
        timestamp: Date.now(),
        query: searchQuery,
        filters: { category, region, duration, sortBy }
      });

      // บันทึก Search History
      await db.collection('searchHistory').add({
        query: searchQuery,
        filters: { category, region, duration, sortBy },
        resultCount: videos.length,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({
      success: true,
      data: videos,
      nextPageToken: nextPageToken,
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
// Helper Functions
// ============================================
function buildSearchQuery(query, category, region) {
  let mandatoryKeywords = [];
  
  mandatoryKeywords.push('travel', 'trip', 'guide', 'review'); 

  const categoryQueries = {
    beach: 'beach resort',
    mountain: 'mountain hiking',
    city: 'city life tour',
    temple: 'temple shrine',
    food: 'street food review',
    adventure: 'adventure activities',
    nature: 'nature park',
    shopping: 'shopping mall market'
  };
  
  if (category !== 'all' && categoryQueries[category]) {
    mandatoryKeywords.push(categoryQueries[category]);
  }

  const regionKeywords = {
    thailand: 'thailand (ภาษาไทย)', 
    japan: 'japan (เที่ยวญี่ปุ่น)',
    korea: 'korea (한국 여행)',
    singapore: 'singapore english vlog',
    vietnam: 'vietnam du lịch',
    indonesia: 'indonesia wisata',
    malaysia: 'malaysia travel vlog'
  };
  
  if (region !== 'all' && regionKeywords[region]) {
    mandatoryKeywords.push(regionKeywords[region]);
  }
  
  let finalQuery = query.trim();

  if (!finalQuery) {
    finalQuery = 'Japan Travel';
  }
  
  const additionalTerms = mandatoryKeywords
    .filter(term => term.toLowerCase() !== query.toLowerCase())
    .join(' ');
  
  const finalSearchString = `${finalQuery} ${additionalTerms}`;

  console.log(`Final YouTube Query: ${finalSearchString}`);
  
  return finalSearchString;
}

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📺 YouTube API Key configured`);
  console.log(`🔥 Firebase connected`);
});

module.exports = app;