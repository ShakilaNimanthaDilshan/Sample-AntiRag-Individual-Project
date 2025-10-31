// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // ✅ new import

const app = express();

// ======================
// 📌 Middleware
// ======================
app.use(cors());
app.use(express.json());

const path = require('path');
// serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Apply global rate limiter (30 requests per minute per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ======================
// 📌 Routes
// ======================
app.get('/', (req, res) => res.send('RAG Platform API is running'));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const universityRoutes = require('./routes/universities');
app.use('/api/universities', universityRoutes);

const reportRoutes = require('./routes/reports');
app.use('/api/reports', reportRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// ======================
// 📌 Database connection
// ======================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ragdb';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ======================
// 📌 Start Server
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
