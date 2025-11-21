const OPENWEATHER_API_KEY = "1e6678bec1ebb5d5314f8541443264ce";

// Element references
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const unitToggle = document.getElementById("unitToggle");

const loader = document.getElementById("loader");
const weatherCard = document.getElementById("weatherCard");
const errorBox = document.getElementById("errorBox");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const localTime = document.getElementById("localTime");
const hourlyForecast = document.getElementById("hourlyForecast");
const favouritesList = document.getElementById("favouritesList");

let currentUnit = "metric"; // default Celsius
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
let use24Hour = true; // 24-hour format global toggle

// ----------------- Live Clock -----------------
let currentTimezoneOffset = 0; // seconds
let clockInterval;

// ----------------- Time Utils -----------------
function formatCityTime(timezoneOffsetSec) {
  const nowUTC = Date.now() + new Date().getTimezoneOffset() * 60000;
  const cityTime = new Date(nowUTC + timezoneOffsetSec * 1000);

  if (use24Hour) {
    const h = String(cityTime.getHours()).padStart(2, "0");
    const m = String(cityTime.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  } else {
    let h = cityTime.getHours();
    const m = String(cityTime.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }
}

function toggleTimeFormat() {
  use24Hour = !use24Hour;
  const city = cityInput.value.trim();
  if (city) fetchWeather(city); // refresh time format
  return use24Hour;
}

// ----------------- Event Listeners -----------------
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
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => showError("Geolocation failed")
    );
  } else showError("Geolocation not supported");
});

unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  unitToggle.textContent = currentUnit === "metric" ? "°C" : "°F";
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

favouritesList.addEventListener("click", (e) => {
  if (e.target.classList.contains("favourite-city")) {
    const city = e.target.dataset.city;
    cityInput.value = city;
    fetchWeather(city);
  }
});

// ----------------- API Fetch Functions -----------------
async function fetchWeather(city) {
  loader.style.display = "block";
  errorBox.style.display = "none";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=${currentUnit}&appid=${OPENWEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    updateUI(data);
    addToFavourites(data.name);
  } catch (err) {
    showError(err.message);
  } finally {
    loader.style.display = "none";
  }
}

async function fetchWeatherByCoords(lat, lon) {
  loader.style.display = "block";
  errorBox.style.display = "none";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${OPENWEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Location weather not found");
    const data = await response.json();
    updateUI(data);
    addToFavourites(data.name);
  } catch (err) {
    showError(err.message);
  } finally {
    loader.style.display = "none";
  }
}

// ----------------- UI Update -----------------
function updateUI(data) {
  // Icon and description
  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  weatherIcon.alt = data.weather[0].description;
  description.textContent = data.weather[0].description;

  // Temperature, humidity, wind
  temperature.textContent = `${Math.round(data.main.temp)}°${
    currentUnit === "metric" ? "C" : "F"
  }`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  wind.textContent = `Wind: ${data.wind.speed} ${
    currentUnit === "metric" ? "m/s" : "mph"
  }`;

  // Local time
  localTime.textContent = formatCityTime(data.timezone);

  // Start live clock
  currentTimezoneOffset = data.timezone;
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    localTime.textContent = formatCityTime(currentTimezoneOffset);
  }, 60000); // every 1 min

  // Dynamic background
  setDynamicBackground(iconCode);

  // Hourly forecast placeholder
  hourlyForecast.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const hourBox = document.createElement("div");
    hourBox.classList.add("hour-box");
    hourBox.textContent = `${i}h: ${Math.round(data.main.temp + i)}°`;
    hourlyForecast.appendChild(hourBox);
  }
}

// ----------------- Helpers -----------------
function setDynamicBackground(iconCode) {
  if (iconCode.includes("d")) {
    document.body.style.background =
      "linear-gradient(135deg, #56CCF2, #2F80ED)";
  } else {
    document.body.style.background =
      "linear-gradient(135deg, #141E30, #243B55)";
  }
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = "block";
}

function addToFavourites(city) {
  if (!favourites.includes(city)) {
    favourites.unshift(city);
    if (favourites.length > 5) favourites.pop();
    localStorage.setItem("favourites", JSON.stringify(favourites));
    renderFavourites();
  }
}

function renderFavourites() {
  favouritesList.innerHTML = "";
  favourites.forEach((city) => {
    const favDiv = document.createElement("div");
    favDiv.classList.add("favourite-city");
    favDiv.dataset.city = city;
    favDiv.textContent = city;
    favouritesList.appendChild(favDiv);
  });
}

// Initial favourites render
renderFavourites();
