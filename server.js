require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static('./'));

// Weather API endpoint
app.get('/api/weather/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.WEATHER_API_KEY}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Weather forecast endpoint
app.get('/api/forecast/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${process.env.WEATHER_API_KEY}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
});

// News API endpoint
app.get('/api/news/:country', async (req, res) => {
    try {
        const { country } = req.params;
        const response = await fetch(
            `https://gnews.io/api/v4/search?q=general&lang=en&country=${country}&token=${process.env.NEWS_API_KEY}&max=10`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news data' });
    }
});

// OpenAI chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: message
                }],
                max_tokens: 150,
                temperature: 0.7
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get chat response' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 