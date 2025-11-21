const OPENWEATHER_API_KEY = "ec0c11b54d7261e647e08d9ccf5b427a";

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
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => showError("Geolocation failed")
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

// Favourites click listener
favouritesList.addEventListener("click", (e) => {
  if (e.target.classList.contains("favourite-city")) {
    const city = e.target.dataset.city;
    cityInput.value = city;
    fetchWeather(city);
  }
});

// -------- Functions --------
async function fetchWeather(city) {
  loader.style.display = "block";
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

function updateUI(data) {
  // Weather icon and description
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
  const timezoneOffset = data.timezone; // in seconds
  const localDate = new Date(
    new Date().getTime() +
      timezoneOffset * 1000 -
      new Date().getTimezoneOffset() * 60000
  );
  localTime.textContent = localDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Dynamic background
  setDynamicBackground(iconCode);

  // Hourly forecast (simplified placeholder)
  hourlyForecast.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const hourBox = document.createElement("div");
    hourBox.classList.add("hour-box");
    hourBox.textContent = `${i}h: ${Math.round(data.main.temp + i)}°`;
    hourlyForecast.appendChild(hourBox);
  }
}

function setDynamicBackground(iconCode) {
  if (iconCode.includes("d")) {
    document.body.style.background =
      "linear-gradient(135deg, #56CCF2, #2F80ED)"; // day
  } else {
    document.body.style.background =
      "linear-gradient(135deg, #141E30, #243B55)"; // night
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

// Initial render of favourites
renderFavourites();
