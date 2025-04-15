// Motivational Quotes
const quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson"
    },
    {
        text: "The best way to predict the future is to create it.",
        author: "Peter Drucker"
    },
    {
        text: "Everything you've ever wanted is on the other side of fear.",
        author: "George Addair"
    },
    {
        text: "The only limit to our realization of tomorrow will be our doubts of today.",
        author: "Franklin D. Roosevelt"
    },
    {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
    },
    {
        text: "Your time is limited, don't waste it living someone else's life.",
        author: "Steve Jobs"
    },
    {
        text: "The journey of a thousand miles begins with one step.",
        author: "Lao Tzu"
    }
];

function updateQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById('quote').textContent = quote.text;
    document.getElementById('author').textContent = `- ${quote.author}`;
}

// Get your API key from: https://openweathermap.org/api
const API_KEY = '9ad57646fcaf467913eb676529722704';
const cities = [
    { name: 'Saint Petersburg', id: 'saint-petersburg' },
    { name: 'Denpasar', id: 'bali' }, // Using Denpasar as the main city in Bali
    { name: 'Bangkok', id: 'bangkok' }
];

async function fetchWeather(city) {
    try {
        // Fetch current weather
        const currentResponse = await fetch(`/api/weather/${encodeURIComponent(city.name)}`);
        
        // Fetch forecast
        const forecastResponse = await fetch(`/api/forecast/${encodeURIComponent(city.name)}`);

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
    for (const city of cities) {
        const weatherData = await fetchWeather(city);
        updateWeatherCard(city, weatherData);
    }
}

// News API configuration
const NEWS_API_KEY = '13b34424ba1999b3ded92f704a649273';
const NEWS_API_URL = 'https://gnews.io/api/v4/search';

class NewsManager {
    constructor() {
        this.countrySelect = document.getElementById('newsCountry');
        this.newsGrid = document.getElementById('newsGrid');
        this.countryFlag = document.getElementById('countryFlag');
        
        // Add event listener for country change
        this.countrySelect.addEventListener('change', () => {
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
            const response = await fetch(`/api/news/${country}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch news: ${response.status}`);
            }

            const data = await response.json();
            if (!data.articles || !Array.isArray(data.articles)) {
                throw new Error('Invalid response format from news API');
            }
            this.displayNews(data.articles);
        } catch (error) {
            console.error('Error fetching news:', error);
            this.newsGrid.innerHTML = `<p class="error">Failed to load news. Error: ${error.message}</p>`;
        }
    }

    displayNews(articles) {
        this.newsGrid.innerHTML = '';
        
        articles.forEach(article => {
            if (!article.title || article.title === '[Removed]') return;
            
            const card = document.createElement('div');
            card.className = 'news-card';
            
            card.innerHTML = `
                <img class="news-image" src="${article.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     alt="${article.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="news-content">
                    <div class="news-title">${article.title}</div>
                    <p class="news-description">${article.description || 'No description available'}</p>
                    <div class="news-meta">
                        <span class="news-source">${article.source.name}</span>
                        <a href="${article.url}" target="_blank" class="news-link">Read More</a>
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
    // Update quote
    updateQuote();
    
    // Initial load
    updateAllWeather();
    newsManager.fetchNews();

    // Add event listener for combined refresh button
    const refreshBtn = document.getElementById('refreshAll');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            updateQuote(); // Update quote on refresh
            await refreshAll();
        });
    }
});

import {
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OPENAI_MAX_TOKENS,
    OPENAI_TEMPERATURE
} from './openai-config.js';

// Chat functionality
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendMessage');

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Handle Enter key
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendButton.addEventListener('click', sendMessage);

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    
    try {
        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.innerHTML = '<div class="message-content">Typing...</div>';
        chatMessages.appendChild(typingDiv);

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        // Remove typing indicator
        chatMessages.removeChild(typingDiv);
        
        if (data.choices && data.choices[0]) {
            addMessage(data.choices[0].message.content);
        } else {
            throw new Error('Invalid response from chat API');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I encountered an error. Please try again.');
    }
}

// Add loading animation to CSS
const style = document.createElement('style');
style.textContent = `
@keyframes typing {
    0% { opacity: 0.3; }
    50% { opacity: 1; }
    100% { opacity: 0.3; }
}

.message-content:contains("Typing...") {
    animation: typing 1.5s infinite;
}`;
document.head.appendChild(style); 