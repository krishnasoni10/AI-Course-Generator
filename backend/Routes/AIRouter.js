const express = require('express');
const router = express.Router();

const { generateCourseLayout } = require('../Controllers/AiContentFormat.js'); 
const { generateChapterContent } = require('../Controllers/AiContentController.js');

const { getVideos } = require('../Controllers/Youtube.js'); 


router.post('/generate-course', generateCourseLayout);
router.post('/generate-chapter', generateChapterContent);

router.get('/get-videos', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query "q" is required.' });
    }

    const videos = await getVideos(q);
    
    res.status(200).json({ success: true, data: videos });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch videos.', error: error.message });
  }
});

module.exports = router;