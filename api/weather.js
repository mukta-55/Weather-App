// api/weather.js
export default async function handler(req, res) {
  const { city, lat, lon, units } = req.query;

  // Ensure either city or coordinates are provided
  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: "City or coordinates are required" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY; // must be set in Vercel
  let apiUrl = "";

  // Build API URL depending on city or coordinates
  if (city) {
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=${units || "metric"}&appid=${apiKey}`;
  } else {
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${
      units || "metric"
    }&appid=${apiKey}`;
  }

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.cod && data.cod !== 200) {
      return res
        .status(data.cod)
        .json({ error: data.message || "City not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Serverless function error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
