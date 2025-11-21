// /api/weather.js

export default async function handler(req, res) {
  const { city, lat, lon, unit } = req.query;

  // Read API key from environment variable
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  let apiUrl;

  if (city) {
    // City name query
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=${unit || "metric"}&appid=${apiKey}`;
  } else if (lat && lon) {
    // Coordinates query
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${
      unit || "metric"
    }&appid=${apiKey}`;
  } else {
    return res
      .status(400)
      .json({ error: "Please provide either city or lat & lon" });
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch weather");
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
