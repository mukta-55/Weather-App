/* Atmos Weather App — Fully Functional JS */

const OPENWEATHER_API_KEY = "a855fdf3492437631d353952b05d3212"; // <-- replace with your API key

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const unitToggle = document.getElementById("unitToggle");

const weatherCard = document.getElementById("weatherCard");
const errorBox = document.getElementById("errorBox");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

let currentUnit = "metric"; // default Celsius

// -------- Event Listeners --------
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetchWeatherByCoords(lat, lon);
      },
      (err) => showError("Geolocation failed")
    );
  } else {
    showError("Geolocation not supported");
  }
});

unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  unitToggle.textContent = currentUnit === "metric" ? "°C" : "°F";
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

// -------- Functions --------
async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=${currentUnit}&appid=${OPENWEATHER_API_KEY}`;
  try {
    errorBox.style.display = "none";
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    updateUI(data);
  } catch (err) {
    showError(err.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${OPENWEATHER_API_KEY}`;
  try {
    errorBox.style.display = "none";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Location weather not found");
    const data = await response.json();
    updateUI(data);
  } catch (err) {
    showError(err.message);
  }
}

function updateUI(data) {
  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  weatherIcon.alt = data.weather[0].description;
  temperature.textContent = `${Math.round(data.main.temp)}°${
    currentUnit === "metric" ? "C" : "F"
  }`;
  description.textContent = data.weather[0].description;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  wind.textContent = `Wind: ${data.wind.speed} ${
    currentUnit === "metric" ? "m/s" : "mph"
  }`;
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = "block";
}
