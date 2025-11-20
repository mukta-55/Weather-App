const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherDisplay = document.getElementById("weather-display");

// Fetch weather using serverless API
async function getWeather(city) {
  const apiUrl = `/api/weather?city=${city}`;

  loading.classList.remove("hidden");
  error.classList.add("hidden");
  weatherDisplay.classList.add("hidden");

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch weather");
    }

    displayWeather(data);
  } catch (err) {
    showError(err.message);
  } finally {
    loading.classList.add("hidden");
  }
}

// Display weather UI
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

// Show error
function showError(message) {
  error.textContent = message;
  error.classList.remove("hidden");
}

// Event listeners
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
