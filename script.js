import { database, ref, onValue, set, get } from './firebase-config.js';

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
        this.countElement = document.getElementById('refreshCount');
        this.counterRef = ref(database, 'refreshCount');
        
        // Listen for counter updates
        onValue(this.counterRef, (snapshot) => {
            const count = snapshot.val() || 0;
            this.updateDisplay(count);
        });
    }

    async increment() {
        try {
            const snapshot = await get(this.counterRef);
            const currentCount = snapshot.val() || 0;
            const newCount = currentCount + 1;
            await set(this.counterRef, newCount);
        } catch (error) {
            console.error('Error updating counter:', error);
        }
    }

    updateDisplay(count) {
        if (this.countElement) {
            this.countElement.textContent = count;
            
            // Add animation
            this.countElement.style.animation = 'none';
            this.countElement.offsetHeight; // Trigger reflow
            this.countElement.style.animation = 'fadeIn 0.5s ease-out';
        }
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
    await refreshTracker.increment(); // Increment counter before fetching weather
    // Track all weather refresh
    if (window.trackAllWeatherRefresh) {
        window.trackAllWeatherRefresh();
    }
    for (const city of cities) {
        const weatherData = await fetchWeather(city);
        updateWeatherCard(city, weatherData);
        // Track individual city refresh
        if (window.trackWeatherRefresh) {
            window.trackWeatherRefresh(city.name);
        }
    }
}

// News API configuration
const NEWS_API_KEY = '1ac6cff8114248f5a47c3d75e0c3433d';
const NEWS_API_URL = 'https://gnews.io/api/v4/top-headlines';

class NewsManager {
    constructor() {
        this.countrySelect = document.getElementById('newsCountry');
        this.newsGrid = document.getElementById('newsGrid');
        this.countryFlag = document.getElementById('countryFlag');
        
        // Add event listener for country change
        this.countrySelect.addEventListener('change', () => {
            const selectedCountry = this.countrySelect.options[this.countrySelect.selectedIndex].text;
            if (window.trackNewsCountryChange) {
                window.trackNewsCountryChange(selectedCountry);
            }
            this.updateFlag();
            this.fetchNews();
        });

        // Set initial flag
        this.updateFlag();
    }

    updateFlag() {
        const selectedOption = this.countrySelect.options[this.countrySelect.selectedIndex];
        const countryCode = this.countrySelect.value.toUpperCase();
        this.countryFlag.src = `https://flagcdn.com/w80/${this.countrySelect.value}.png`;
        this.countryFlag.alt = `${selectedOption.text} flag`;
    }

    async fetchNews() {
        try {
            const country = this.countrySelect.value;
            const url = `${NEWS_API_URL}?category=general&lang=en&country=${country}&token=${NEWS_API_KEY}&max=10`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('News API Error:', errorData);
                throw new Error(`Failed to fetch news: ${response.status}`);
            }

            const data = await response.json();
            if (!data.articles || !Array.isArray(data.articles)) {
                throw new Error('Invalid response format from news API');
            }
            this.displayNews(data.articles);
        } catch (error) {
            console.error('Error fetching news:', error);
            this.newsGrid.innerHTML = '<p class="error">Failed to load news. Please try again later.</p>';
        }
    }

    displayNews(articles) {
        this.newsGrid.innerHTML = '';
        
        articles.forEach(article => {
            if (!article.title || article.title === '[Removed]') return;
            
            const card = document.createElement('div');
            card.className = 'news-card';
            
            card.innerHTML = `
                <img class="news-image" src="${article.urlToImage || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     alt="${article.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="news-content">
                    <div class="news-title">${article.title}</div>
                    <p class="news-description">${article.description || 'No description available'}</p>
                    <div class="news-meta">
                        <span class="news-source">${article.source.name}</span>
                        <a href="${article.url}" target="_blank" class="news-link" onclick="if(window.trackArticleClick){window.trackArticleClick('${article.title.replace(/'/g, "\\'")}', '${article.source.name.replace(/'/g, "\\'")}')}">Read More</a>
                    </div>
                </div>
            `;
            
            this.newsGrid.appendChild(card);
        });
    }
}

// Initialize managers
const newsManager = new NewsManager();

// Combined refresh function
async function refreshAll() {
    const refreshBtn = document.getElementById('refreshAll');
    refreshBtn.classList.add('refreshing');
    
    try {
        // Refresh both weather and news
        await Promise.all([
            updateAllWeather(),
            newsManager.fetchNews()
        ]);
    } finally {
        refreshBtn.classList.remove('refreshing');
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    updateAllWeather();
    newsManager.fetchNews();

    // Add event listener for combined refresh button
    const refreshBtn = document.getElementById('refreshAll');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshAll);
    }
}); 