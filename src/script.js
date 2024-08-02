const apiKey = "9dfcee2378b00694fe3cdd2f4a83a8bd";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherIcon = document.getElementById("weather-icon");
const errorElement = document.getElementById("error-message");
const weatherInfo = document.getElementById("weather-info");
const recentDropdown = document.getElementById("recent-cities");
const forecastContainer = document.getElementById("forecast");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

// Function to check weather for a given city
async function checkWeather(city) {
    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
        if (response.status === 404) {
            errorElement.style.display = "block";
            weatherInfo.style.display = "none";
        } else {
            const data = await response.json();

            document.getElementById("city-name").innerHTML = data.name;
            document.getElementById("temperature").innerHTML = Math.round(data.main.temp) + "°C";
            document.getElementById("humidity").innerHTML = data.main.humidity + "%";
            document.getElementById("wind-speed").innerHTML = data.wind.speed + " km/h";

            switch (data.weather[0].main) {
                case "Clouds":
                    weatherIcon.src = "images/clouds.png";
                    break;
                case "Clear":
                    weatherIcon.src = "images/clear.png";
                    break;
                case "Rain":
                    weatherIcon.src = "images/rain.png";
                    break;
                case "Drizzle":
                    weatherIcon.src = "images/drizzle.png";
                    break;
                case "Mist":
                    weatherIcon.src = "images/mist.png";
                    break;
                default:
                    weatherIcon.src = "images/default.png";
                    break;
            }

            weatherInfo.style.display = "block";
            errorElement.style.display = "none";

            // Add to recent cities if not already present
            if (!recentCities.includes(data.name)) {
                recentCities.push(data.name);
                if (recentCities.length > 5) {
                    recentCities.shift(); // Keep only the last 5 cities
                }
                localStorage.setItem("recentCities", JSON.stringify(recentCities));
                updateRecentDropdown();
            }

            // Fetch and display 5-day forecast
            fetchFiveDayForecast(data.coord.lat, data.coord.lon);
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        errorElement.style.display = "block";
        weatherInfo.style.display = "none";
    }
}

// Update the recent cities dropdown
function updateRecentDropdown() {
    recentDropdown.innerHTML = '<option value="">Select Recent City</option>';
    recentCities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        recentDropdown.appendChild(option);
    });
}

// Fetch and display 5-day forecast
async function fetchFiveDayForecast(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const response = await fetch(forecastUrl);
    const data = await response.json();

    // Clear previous forecast
    forecastContainer.innerHTML = "";

    // Loop through forecast data (every 8th item for daily forecast)
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: 'short' });

        const forecastElement = document.createElement("div");
        forecastElement.className = "forecast-day text-center";
        forecastElement.innerHTML = `
            <p class="text-white">${dayName}</p>
            <img src="images/${getWeatherIcon(forecast.weather[0].main)}" alt="weather icon" class="w-12 mx-auto my-2">
            <p class="text-white">${Math.round(forecast.main.temp)}°C</p>
            <p class="text-sm text-gray-300">${forecast.wind.speed} km/h</p>
            <p class="text-sm text-gray-300">${forecast.main.humidity}%</p>
        `;
        forecastContainer.appendChild(forecastElement);
    }
}

// Get weather icon based on condition
function getWeatherIcon(condition) {
    switch (condition) {
        case "Clouds":
            return "clouds.png";
        case "Clear":
            return "clear.png";
        case "Rain":
            return "rain.png";
        case "Drizzle":
            return "drizzle.png";
        case "Mist":
            return "mist.png";
        default:
            return "default.png";
    }
}

// Event listener for the search button
searchBtn.addEventListener("click", () => {
    const city = searchBox.value.trim();
    if (city !== "") {
        checkWeather(city);
    } else {
        errorElement.textContent = "Please enter a city name.";
        errorElement.style.display = "block";
    }
});

// Event listener for the recent cities dropdown
recentDropdown.addEventListener("change", (event) => {
    const selectedCity = event.target.value;
    if (selectedCity) {
        checkWeather(selectedCity);
    }
});

// Load last searched cities on page load
window.addEventListener("load", () => {
    updateRecentDropdown();
});
