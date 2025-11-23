console.log("JS is running...");

const API_KEY = "542381f91649bd295b41fa7726bf812e"; // your key

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherDisplay = document.getElementById("weather-display");

// Fetch weather data
async function getWeather(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;

  // UI states
  loading.classList.remove("hidden");
  error.classList.add("hidden");
  weatherDisplay.classList.add("hidden");

  try {
    console.log("Fetching URL:", apiUrl);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please check the spelling.");
      } else {
        throw new Error("Failed to fetch weather data. Please try again.");
      }
    }

    const data = await response.json();
    displayWeather(data);
  } catch (err) {
    showError(err.message);
  } finally {
    loading.classList.add("hidden");
  }
}

// Display data
function displayWeather(data) {
  document.getElementById(
    "city-name"
  ).textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("temp").textContent = Math.round(data.main.temp);
  document.getElementById("feels-like").textContent = Math.round(
    data.main.feels_like
  );
  document.getElementById("humidity").textContent = data.main.humidity;
  document.getElementById("wind").textContent = data.wind.speed;
  document.getElementById("description").textContent =
    data.weather[0].description;

  const iconCode = data.weather[0].icon;
  document.getElementById(
    "weather-icon"
  ).src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherDisplay.classList.remove("hidden");
}

// Show errors
function showError(message) {
  error.textContent = message;
  error.classList.remove("hidden");
}

// Events
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (city) {
    getWeather(city);
  } else {
    showError("Please enter a city name");
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Load default city
getWeather("London");
