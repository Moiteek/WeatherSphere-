// API key for WeatherAPI.com (you'll need to sign up for a free key)
const API_KEY = '39068ad4b9214973a5c184915251805'; // Replace with your actual API key
const BASE_URL = 'https://api.weatherapi.com/v1';

// DOM Elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const currentCity = document.getElementById('current-city');
const currentTemp = document.getElementById('current-temp');
const currentCondition = document.getElementById('current-condition');
const weatherImg = document.getElementById('weather-img');
const windSpeed = document.getElementById('wind-speed');
const humidity = document.getElementById('humidity');
const uvIndex = document.getElementById('uv-index');
const forecastContainer = document.getElementById('forecast-container');

// Fetch weather data
async function fetchWeatherData(location) {
    try {
        // Fetch current weather
        const currentResponse = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${location}&aqi=no`);
        const currentData = await currentResponse.json();
        
        // Fetch forecast
        const forecastResponse = await fetch(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=5&aqi=no&alerts=no`);
        const forecastData = await forecastResponse.json();
        
        return {
            current: currentData,
            forecast: forecastData
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data. Please try again.');
        return null;
    }
}

// Update current weather UI
function updateCurrentWeather(data) {
    if (!data || !data.current) return;
    
    const { location, current } = data;
    
    currentCity.textContent = `${location.name}, ${location.country}`;
    currentTemp.textContent = Math.round(current.temp_c);
    currentCondition.textContent = current.condition.text;
    weatherImg.src = `https:${current.condition.icon}`;
    weatherImg.alt = current.condition.text;
    windSpeed.textContent = `${current.wind_kph} km/h`;
    humidity.textContent = `${current.humidity}%`;
    uvIndex.textContent = current.uv;
}

// Update forecast UI
function updateForecast(data) {
    if (!data || !data.forecast) return;
    
    forecastContainer.innerHTML = '';
    
    const forecastDays = data.forecast.forecastday;
    
    forecastDays.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <div class="forecast-condition">${day.day.condition.text}</div>
            <div class="forecast-temp">
                <span class="max-temp">${Math.round(day.day.maxtemp_c)}°</span>
                <span class="min-temp">${Math.round(day.day.mintemp_c)}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Get weather by location
async function getWeatherByLocation(location) {
    const weatherData = await fetchWeatherData(location);
    if (weatherData) {
        updateCurrentWeather(weatherData);
        updateForecast(weatherData);
    }
}

// Get weather by current geolocation
function getWeatherByGeolocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await getWeatherByLocation(`${latitude},${longitude}`);
        },
        (error) => {
            console.error('Error getting location:', error);
            alert('Unable to retrieve your location. Please enable location services or search manually.');
        }
    );
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location) {
        getWeatherByLocation(location);
    } else {
        alert('Please enter a location');
    }
});

currentLocationBtn.addEventListener('click', getWeatherByGeolocation);

locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const location = locationInput.value.trim();
        if (location) {
            getWeatherByLocation(location);
        }
    }
});

// Initialize with default location
document.addEventListener('DOMContentLoaded', () => {
    getWeatherByLocation('London'); // Default location
});