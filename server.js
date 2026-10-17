const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// कॉन्फ़िगरेशन लोड करें
dotenv.config();

const app = express();

// सिक्योरिटी और डेटा पार्सिंग सेटिंग्स
app.use(cors());
app.use(express.json()); 

// 1. फ्री क्लाउड डेटाबेस (MongoDB Atlas) से कनेक्शन
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/company_survey_db";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Database से सफलतापूर्वक कनेक्ट हो गए!"))
  .catch((err) => console.error("❌ डेटाबेस कनेक्शन एरर:", err));

// 2. डेटाबेस का ढांचा (Survey Database Schema)
const SurveySchema = new mongoose.Schema({
  departmentName: { type: String, required: true }, // जैसे: HR, Sales, IT Support
  employeeId: { type: String, required: true },     // कर्मचारी की आईडी
  rating: { type: Number, required: true, min: 1, max: 5 }, // 1 से 5 स्टार रेटिंग
  feedbackText: { type: String, required: true },   // लिखित फीडबैक
  submittedAt: { type: Date, default: Date.now }    // तारीख और समय
});

const Survey = mongoose.model('Survey', SurveySchema);

// 3. API एंडपॉइंट्स (Routes)

// रूट (Home API): यह चेक करने के लिए कि सर्वर चल रहा है या नहीं
app.get('/', (req, res) => {
  res.send("🚀 सेंट्रलाइज्ड कंपनी सर्वे सर्वर लाइव है और सही काम कर रहा है!");
});

// API 1: किसी भी सर्विस या डिपार्टमेंट से सर्वे डेटा कलेक्ट (Save) करने के लिए
app.post('/api/submit-survey', async (req, res) => {
  try {
    const { departmentName, employeeId, rating, feedbackText } = req.body;
    
    // नया सर्वे रिकॉर्ड ऑब्जेक्ट
    const newSurvey = new Survey({
      departmentName,
      employeeId,
      rating,
      feedbackText
    });

    // डेटाबेस में सेव करें
    await newSurvey.save();
    res.status(201).json({ 
      success: true, 
      message: "🎉 सर्वे डेटा सेंट्रलाइज्ड सर्वर पर सुरक्षित सेव हो गया है!" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "सर्वर एरर: डेटाबेस में डेटा सेव नहीं हो पाया।" 
    });
  }
});

// API 2: मेन डैशबोर्ड (Frontend) के लिए सारा कलेक्टेड डेटा एक साथ प्राप्त करने के लिए
app.get('/api/analytics', async (req, res) => {
  try {
    // नया डेटा पहले दिखाने के लिए सॉर्टिंग (-1)
    const allSurveys = await Survey.find().sort({ submittedAt: -1 });
    res.status(200).json(allSurveys);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "डेटा प्राप्त करने में एरर आई है।" 
    });
  }
});

// 4. सर्वर पोर्ट कॉन्फ़िगरेशन
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 सर्वर पोर्ट ${PORT} पर लाइव रन हो रहा है...`);
});
                          
