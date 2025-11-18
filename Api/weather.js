// api/weather.js
export default async function handler(req, res) {
    const city = req.query.city; // get city from frontend
    const apiKey = process.env.OPENWEATHER_API_KEY; // hidden key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (response.ok) {
            res.status(200).json(data);
        } else {
            res.status(response.status).json({ error: data.message });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}
