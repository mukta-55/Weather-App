// Elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const countrySelect = document.getElementById("countrySelect");
const unitToggle = document.getElementById("unitToggle");
const geoBtn = document.getElementById("geoBtn");

const loader = document.getElementById("loader");
const errorMsg = document.getElementById("errorMsg");
const lastFetched = document.getElementById("lastFetched");
const card = document.getElementById("card");

// Data display elements
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const cityEl = document.getElementById("city");
const timeEl = document.getElementById("time");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const coordsEl = document.getElementById("coords");
const openMap = document.getElementById("openMap");
const forecastEl = document.getElementById("forecast");

// App state
let useCelsius = true;
let lastData = null;

// Quick city list
const QUICK = [
  { label: "Nairobi, Kenya 🇰🇪", lat: -1.286389, lon: 36.817223 },
  { label: "London, UK 🇬🇧", lat: 51.5074, lon: -0.1278 },
  { label: "New York, USA 🇺🇸", lat: 40.7128, lon: -74.006 },
  { label: "Tokyo, Japan 🇯🇵", lat: 35.6895, lon: 139.6917 },
  { label: "Paris, France 🇫🇷", lat: 48.8566, lon: 2.3522 },
  { label: "Berlin, Germany 🇩🇪", lat: 52.52, lon: 13.405 },
  { label: "Lagos, Nigeria 🇳🇬", lat: 6.5244, lon: 3.3792 },
  { label: "Cape Town, South Africa 🇿🇦", lat: -33.9249, lon: 18.4241 },
  { label: "Sydney, Australia 🇦🇺", lat: -33.8688, lon: 151.2093 },
  { label: "Rio de Janeiro, Brazil 🇧🇷", lat: -22.9068, lon: -43.1729 },
];

// Populate selector
QUICK.forEach((c, idx) => {
  const opt = document.createElement("option");
  opt.value = idx;
  opt.textContent = c.label;
  countrySelect.appendChild(opt);
});

// -------------------------
// Helpers
// -------------------------
function showLoader(show = true) {
  loader.classList.toggle("hidden", !show);
  if (show) errorMsg.classList.add("hidden");
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
  showLoader(false);
}

function formatTempC(temp) {
  return `${Math.round(temp)}°C`;
}

function formatTempF(temp) {
  return `${Math.round((temp * 9) / 5 + 32)}°F`;
}

function formatTemp(temp) {
  return useCelsius ? formatTempC(temp) : formatTempF(temp);
}

function fmtTime(unixSec, tzOffset = 0) {
  const d = new Date((unixSec + tzOffset) * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function setBGForWeather(main) {
  const el = document.body;
  el.classList.remove(
    "bg-clear",
    "bg-clouds",
    "bg-rain",
    "bg-snow",
    "bg-thunder",
    "bg-mist"
  );
  switch (main.toLowerCase()) {
    case "clear":
      el.classList.add("bg-clear");
      break;
    case "clouds":
      el.classList.add("bg-clouds");
      break;
    case "rain":
    case "drizzle":
      el.classList.add("bg-rain");
      break;
    case "thunderstorm":
      el.classList.add("bg-thunder");
      break;
    case "snow":
      el.classList.add("bg-snow");
      break;
    default:
      el.classList.add("bg-mist");
      break;
  }
}

function weatherEmoji(main) {
  if (main === "Clear") return "☀️";
  if (main === "Clouds") return "☁️";
  if (main === "Rain" || main === "Drizzle") return "🌧️";
  if (main === "Thunderstorm") return "⛈️";
  if (main === "Snow") return "❄️";
  return "🌫️";
}

// -------------------------
// Fetch weather via serverless function
// -------------------------
async function fetchWeather(city) {
  showLoader(true);
  try {
    const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    lastData = data;
    renderWeather(data);
    showLoader(false);
    lastFetched.textContent = `Last fetched: ${new Date().toLocaleString()}`;
  } catch (err) {
    console.error(err);
    showError("Failed to fetch weather. Check network or city name.");
  }
}

// -------------------------
// Render functions
// -------------------------
function renderWeather(data) {
  if (!data) return;
  const { weather, main, wind, sys, coord, timezone, name } = data;
  const mainW = weather[0].main;
  const desc = weather[0].description;

  // Icon
  iconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${
    weather[0].icon
  }@2x.png" alt="${desc}" width="72" height="72" onerror="this.style.display='none'">${weatherEmoji(
    mainW
  )}`;

  tempEl.textContent = formatTemp(main.temp);
  descEl.textContent = desc;
  cityEl.textContent = `${name}, ${sys?.country || ""}`;
  timeEl.textContent = `Local time: ${new Date(
    Date.now() + (timezone || 0) * 1000 - new Date().getTimezoneOffset() * 60000
  ).toLocaleString()}`;
  humidityEl.textContent = `${main.humidity}%`;
  windEl.textContent = `${wind.speed} m/s`;
  pressureEl.textContent = `${main.pressure} hPa`;
  sunriseEl.textContent = fmtTime(sys.sunrise, timezone);
  sunsetEl.textContent = fmtTime(sys.sunset, timezone);
  coordsEl.textContent = `${coord.lat.toFixed(3)}, ${coord.lon.toFixed(3)}`;
  openMap.href = `https://www.openstreetmap.org/?mlat=${coord.lat}&mlon=${coord.lon}#map=10/${coord.lat}/${coord.lon}`;

  renderForecast(data);
  setBGForWeather(mainW);
}

function renderForecast(data) {
  forecastEl.innerHTML = "";
  const now = Date.now();
  const baseTemp = data.main.temp;
  for (let i = 0; i < 5; i++) {
    const hour = new Date(now + i * 3600 * 1000);
    const temp = baseTemp + Math.sin(i) * 2;
    const item = document.createElement("div");
    item.className = "hour";
    item.innerHTML = `
      <div class="time">${hour.getHours().toString().padStart(2, "0")}:00</div>
      <div class="icon">${weatherEmoji(data.weather[0].main)}</div>
      <div class="temp">${formatTemp(temp)}</div>
      <small>${data.weather[0].description}</small>
    `;
    forecastEl.appendChild(item);
  }
}

// -------------------------
// Event listeners
// -------------------------
searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) fetchWeather(city);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// Quick city select
countrySelect.addEventListener("change", (e) => {
  const idx = Number(e.target.value);
  if (Number.isFinite(idx) && QUICK[idx])
    fetchWeather(QUICK[idx].label.split(",")[0]);
});

// Unit toggle
unitToggle.addEventListener("click", () => {
  useCelsius = !useCelsius;
  unitToggle.textContent = useCelsius ? "°C" : "°F";
  if (lastData) renderWeather(lastData);
});

// Geolocation
geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return showError("Geolocation not supported.");
  showLoader(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
    () => showError("Unable to get your location.")
  );
});

// Keyboard quick nav
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    countrySelect.selectedIndex = Math.min(
      countrySelect.options.length - 1,
      countrySelect.selectedIndex + 1
    );
    countrySelect.dispatchEvent(new Event("change"));
  }
  if (e.key === "ArrowDown") {
    countrySelect.selectedIndex = Math.max(0, countrySelect.selectedIndex - 1);
    countrySelect.dispatchEvent(new Event("change"));
  }
});

// Initial load: default Nairobi
fetchWeather("Nairobi");
