const axios = require("axios");

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

/**
 *
 * @param {string} query
 * @returns {Array}
 */
const getVideos = async (query) => {
  try {
    const params = {
      part: "snippet",
      q: query,
      key: process.env.NODE_YOUTUBE_API_KEY,
      type: "video",
      maxResults: 4,
      videoDuration: "medium",
      safeSearch: "strict",
    };

    const resp = await axios.get(`${YOUTUBE_BASE_URL}/search`, {
      params,
      timeout: 4500,
    });

    const items = resp.data.items || [];

    const filtered = items.filter(
      (v) => v.snippet?.title && v.snippet.title.length > 10
    );

    const unique = [];
    const seen = new Set();

    for (const v of filtered) {
      const videoId = v.id?.videoId;
      if (videoId && !seen.has(videoId)) {
        seen.add(videoId);
        unique.push(v);
      }
    }

    return unique.slice(0, 3);

  } catch (error) {
    console.error(
      "Error fetching YouTube videos:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch videos from YouTube.");
  }
};

module.exports = { getVideos };
