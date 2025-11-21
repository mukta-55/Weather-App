/* Aurora Weather App – Clean, Stable, Interactive */

const apiKey = "a855fdf3492437631d353952b05d3212"; // <-- replace this

const input = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherCard = document.getElementById("weatherCard");
const errorBox = document.getElementById("errorBox");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

// Search by button click
searchBtn.addEventListener("click", () => {
  const city = input.value.trim();
  if (city) fetchWeather(city);
});

// Search by Enter key
input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const city = input.value.trim();
    if (city) fetchWeather(city);
  }
});

// Fetch Weather Function
async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try {
    errorBox.style.display = "none";
    weatherCard.classList.remove("show");

    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    updateUI(data);
  } catch (err) {
    showError("City not found. Try again.");
  }
}

// Update UI Function
function updateUI(data) {
  const iconCode = data.weather[0].icon;

  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  temperature.innerHTML = `${Math.round(data.main.temp)}°C`;
  description.innerHTML = data.weather[0].description;
  humidity.innerHTML = data.main.humidity + "%";
  wind.innerHTML = data.wind.speed + " m/s";

  weatherCard.classList.add("show");
}

// Error display
function showError(msg) {
  errorBox.innerText = msg;
  errorBox.style.display = "block";
}
