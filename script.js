// Get your API key from: https://openweathermap.org/api
// After signing up, replace 'YOUR_API_KEY' below with your actual API key
const API_KEY = '9ad57646fcaf467913eb676529722704';
const cities = [
    { name: 'Saint Petersburg', id: 'saint-petersburg' },
    { name: 'Denpasar', id: 'bali' }, // Using Denpasar as the main city in Bali
    { name: 'Bangkok', id: 'bangkok' }
];

// Analytics tracking
class RefreshTracker {
    constructor() {
        this.count = parseInt(localStorage.getItem('weatherRefreshCount')) || 0;
        this.countElement = document.getElementById('refreshCount');
        this.displayCount();
    }

    increment() {
        this.count++;
        localStorage.setItem('weatherRefreshCount', this.count.toString());
        this.displayCount();
    }

    displayCount() {
        if (this.countElement) {
            this.countElement.textContent = this.count;
            
            // Reset animation
            this.countElement.style.animation = 'none';
            this.countElement.offsetHeight; // Trigger reflow
            this.countElement.style.animation = 'fadeIn 0.5s ease-out';
        }
    }

    reset() {
        this.count = 0;
        localStorage.setItem('weatherRefreshCount', '0');
        this.displayCount();
    }
}

// Initialize the refresh tracker
const refreshTracker = new RefreshTracker();

async function fetchWeather(city) {
    try {
        // Fetch current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&units=metric&appid=${API_KEY}`
        );
        
        // Fetch forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city.name}&units=metric&appid=${API_KEY}`
        );

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Weather data not available');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        return {
            current: currentData,
            forecast: forecastData
        };
    } catch (error) {
        console.error(`Error fetching weather for ${city.name}:`, error);
        return null;
    }
}

function getWeatherIcon(weatherCode) {
    const icons = {
        '01': 'sun',
        '02': 'cloud-sun',
        '03': 'cloud',
        '04': 'cloud',
        '09': 'cloud-showers-heavy',
        '10': 'cloud-rain',
        '11': 'bolt',
        '13': 'snowflake',
        '50': 'smog'
    };
    
    const prefix = weatherCode.substring(0, 2);
    return icons[prefix] || 'cloud';
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function updateWeatherCard(city, weatherData) {
    const card = document.getElementById(city.id);
    const forecastContainer = document.getElementById(`${city.id}-forecast`);
    
    if (!weatherData) {
        card.querySelector('.temperature').textContent = 'Data unavailable';
        card.querySelector('.description').textContent = 'Please try again later';
        card.querySelector('.humidity').textContent = '';
        forecastContainer.querySelector('.forecast-cards').innerHTML = '';
        return;
    }

    const current = weatherData.current;
    const forecast = weatherData.forecast;

    // Update current weather
    card.querySelector('.temperature').textContent = `${Math.round(current.main.temp)}°C`;
    card.querySelector('.description').textContent = current.weather[0].description;
    card.querySelector('.humidity').textContent = `Humidity: ${current.main.humidity}%`;

    // Update forecast
    const forecastCards = forecastContainer.querySelector('.forecast-cards');
    forecastCards.innerHTML = '';

    // Get one forecast per day (excluding today)
    const dailyForecasts = forecast.list.reduce((acc, item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = item;
        }
        return acc;
    }, {});

    // Convert to array and remove today
    const forecasts = Object.values(dailyForecasts).slice(1, 8);

    forecasts.forEach(item => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="date">${formatDate(item.dt)}</div>
            <i class="fas fa-${getWeatherIcon(item.weather[0].icon)} weather-icon"></i>
            <div class="temp">${Math.round(item.main.temp)}°C</div>
            <div class="desc">${item.weather[0].description}</div>
        `;
        forecastCards.appendChild(forecastCard);
    });
}

async function updateAllWeather() {
    refreshTracker.increment(); // Increment counter before fetching weather
    for (const city of cities) {
        const weatherData = await fetchWeather(city);
        updateWeatherCard(city, weatherData);
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initial load without incrementing counter
    (async () => {
        for (const city of cities) {
            const weatherData = await fetchWeather(city);
            updateWeatherCard(city, weatherData);
        }
    })();

    // Add event listener for refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', updateAllWeather);
    }
}); 