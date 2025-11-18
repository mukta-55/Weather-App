/* Atmos — Interactive Weather App
   Features:
   - Search by city
   - Quick selector of capitals (jump between countries)
   - Geolocation
   - Unit toggle (C/F)
   - Animated backgrounds via CSS classes
   - Loader & error handling
   - Uses OpenWeather current weather by lat/lon endpoint as requested
*/

const API_KEY = "c0c77c983f0c6fcb7486e32fceab077b";
const BASE =
  "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API}";
const ICON_URL = "https://openweathermap.org/img/wn/"; // + icon + @2x.png

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

// app state
let useCelsius = true;
let lastData = null;

/* ----------------------------
   Quick country/city list (capital cities + lat/lon)
   You can expand this list as needed.
   ----------------------------*/
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

// populate selector
function populateQuick() {
  QUICK.forEach((c, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = c.label;
    countrySelect.appendChild(opt);
  });
}
populateQuick();

/* ----------------------------
   Helpers
   ----------------------------*/
function showLoader(show = true) {
  loader.classList.toggle("hidden", !show);
  if (show) errorMsg.classList.add("hidden");
}
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
  showLoader(false);
}
function kelvinToC(k) {
  return k - 273.15;
}
function kelvinToF(k) {
  return ((k - 273.15) * 9) / 5 + 32;
}
function formatTemp(k) {
  return useCelsius
    ? `${Math.round(kelvinToC(k))}°C`
    : `${Math.round(kelvinToF(k))}°F`;
}
function fmtTime(unixSec, tzOffset = 0) {
  // tzOffset in seconds (from API)
  const d = new Date((unixSec + tzOffset) * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function setBGForWeather(main) {
  // Add small class changes to body/card to hint weather
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

/* tiny animated icon mapping using emoji fallback + openweather icon */
function weatherEmoji(main, id) {
  if (main === "Clear") return "☀️";
  if (main === "Clouds") return "☁️";
  if (main === "Rain" || main === "Drizzle") return "🌧️";
  if (main === "Thunderstorm") return "⛈️";
  if (main === "Snow") return "❄️";
  return "🌫️";
}

/* ----------------------------
   Core: fetch weather by lat/lon
   Uses the user's endpoint pattern provided in prompt.
   ----------------------------*/
async function fetchWeatherByCoords(lat, lon) {
  showLoader(true);
  errorMsg.classList.add("hidden");

  const url = BASE.replace("{lat}", encodeURIComponent(lat))
    .replace("{lon}", encodeURIComponent(lon))
    .replace("{API}", encodeURIComponent(API_KEY));
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    lastData = data;
    renderWeather(data);
    showLoader(false);
    lastFetched.textContent = `Last fetched: ${new Date().toLocaleString()}`;
  } catch (err) {
    console.error(err);
    showError("Failed to fetch weather. Check your network or API key.");
  }
}

/* render main weather card */
function renderWeather(data) {
  if (!data) return;
  const { weather, main, wind, sys, coord, timezone, name } = data;
  const mainW = weather[0].main;
  const desc = weather[0].description;
  const icon = weather[0].icon; // e.g. 01d

  // icon (use img + emoji fallback)
  iconEl.innerHTML = `<img src="${ICON_URL}${icon}@2x.png" alt="${desc}" width="72" height="72" onerror="this.style.display='none'">${weatherEmoji(
    mainW,
    icon
  )}`;

  tempEl.textContent = formatTemp(main.temp);
  descEl.textContent = desc;
  cityEl.textContent = `${name}, ${sys && sys.country ? sys.country : ""}`;
  timeEl.textContent = `Local time: ${new Date(
    Date.now() + timezone * 1000 - new Date().getTimezoneOffset() * 60000
  ).toLocaleString()}`; // rough local time
  humidityEl.textContent = `${main.humidity}%`;
  windEl.textContent = `${wind.speed} m/s`;
  pressureEl.textContent = `${main.pressure} hPa`;
  sunriseEl.textContent = fmtTime(sys.sunrise, timezone);
  sunsetEl.textContent = fmtTime(sys.sunset, timezone);
  coordsEl.textContent = `${coord.lat.toFixed(3)}, ${coord.lon.toFixed(3)}`;
  openMap.href = `https://www.openstreetmap.org/?mlat=${coord.lat}&mlon=${coord.lon}#map=10/${coord.lat}/${coord.lon}`;

  // forecast placeholder: replicate some hourly info using current + simple derived hours
  renderForecast(data);

  setBGForWeather(mainW);
}

/* simple forecast: make 5 'hours' using current temp +/- */
function renderForecast(data) {
  forecastEl.innerHTML = "";
  const now = Date.now();
  const baseTempk = data.main.temp;
  for (let i = 0; i < 5; i++) {
    const hour = new Date(now + i * 3600 * 1000);
    const tK = baseTempk + Math.sin(i) * 2; // synthetic
    const item = document.createElement("div");
    item.className = "hour";
    item.innerHTML = `<div class="time">${hour
      .getHours()
      .toString()
      .padStart(2, "0")}:00</div>
                      <div class="icon">${weatherEmoji(
                        data.weather[0].main
                      )}</div>
                      <div class="temp">${
                        useCelsius
                          ? Math.round(kelvinToC(tK)) + "°C"
                          : Math.round(kelvinToF(tK)) + "°F"
                      }</div>
                      <small>${data.weather[0].description}</small>`;
    forecastEl.appendChild(item);
  }
}

/* ----------------------------
   Search by city name - uses geocoding (openweathermap has geocoding but to keep to the prompt we will use direct fetch to find lat/lon via "weather?q=" then call lat/lon endpoint to match the requested pattern)
   ----------------------------*/
async function searchByCityName(city) {
  if (!city || city.trim().length === 0) return;
  showLoader(true);
  try {
    // use the convenient weather?q= endpoint to get coords
    const qUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}`;
    const r = await fetch(qUrl);
    if (!r.ok) throw new Error("City not found");
    const json = await r.json();
    // now call fetchWeatherByCoords using lat/lon to follow the specified pattern
    const { coord } = json;
    if (coord && coord.lat != null && coord.lon != null) {
      await fetchWeatherByCoords(coord.lat, coord.lon);
    } else {
      throw new Error("No coordinates returned");
    }
  } catch (err) {
    console.error(err);
    showError("City not found. Try another name or use the picker.");
  }
}

/* ----------------------------
   UI wiring
   ----------------------------*/
searchBtn.addEventListener("click", () => {
  const q = searchInput.value;
  searchByCityName(q);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchByCityName(searchInput.value);
});

// country quick select
countrySelect.addEventListener("change", (e) => {
  const idx = Number(e.target.value);
  if (Number.isFinite(idx) && QUICK[idx]) {
    const { lat, lon } = QUICK[idx];
    fetchWeatherByCoords(lat, lon);
  }
});

// unit toggle
unitToggle.addEventListener("click", () => {
  useCelsius = !useCelsius;
  unitToggle.textContent = useCelsius ? "°C" : "°F";
  unitToggle.setAttribute("aria-pressed", (!useCelsius).toString());
  if (lastData) renderWeather(lastData);
});

// geolocation
geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation not supported by your browser.");
    return;
  }
  showLoader(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    },
    (err) => {
      console.error(err);
      showError(
        "Unable to get your location. Allow location access or use search."
      );
    },
    { timeout: 10000 }
  );
});

/* initial default */
fetchWeatherByCoords(-1.286389, 36.817223); // Nairobi default

/* Extra: small keyboard hint: ArrowUp selects next quick city */
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    countrySelect.selectedIndex = Math.min(
      countrySelect.options.length - 1,
      countrySelect.selectedIndex + 1
    );
    countrySelect.dispatchEvent(new Event("change"));
  } else if (e.key === "ArrowDown") {
    countrySelect.selectedIndex = Math.max(0, countrySelect.selectedIndex - 1);
    countrySelect.dispatchEvent(new Event("change"));
  }
});

/* small polish: hide loader on network idle after 10s */
setTimeout(() => showLoader(false), 10000);
