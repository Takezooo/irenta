import express from "express";
import axios from "axios";

const router = express.Router();

// Load API key from environment variable
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Endpoint for geocoding
router.get("/geocode", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and Longitude are required." });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          latlng: `${lat},${lng}`,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Geocoding API error:", error.message);
    res.status(500).json({ error: "Failed to fetch geocoding data." });
  }
});

// Endpoint for autocomplete
router.get("/autocomplete", async (req, res) => {
  const { input } = req.query;

  if (!input) {
    return res.status(400).json({ error: "Input is required for autocomplete." });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
      {
        params: {
          input,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Autocomplete API error:", error.message);
    res.status(500).json({ error: "Failed to fetch autocomplete data." });
  }
});

export default router;
