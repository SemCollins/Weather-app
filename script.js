const API_KEY = 'demo'; // In production, use a real API key
const cities = new Set();
let isLoading = false;
let useCelsius = true;
let currentView = 'grid';

// Weather icon mapping
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

// Map weather codes to Font Awesome icons
const faWeatherIcons = {
    'Clear': 'fa-sun',
    'Clouds': 'fa-cloud',
    'Rain': 'fa-cloud-showers-heavy',
    'Drizzle': 'fa-cloud-rain',
    'Thunderstorm': 'fa-bolt',
    'Snow': 'fa-snowflake',
    'Mist': 'fa-smog',
    'Smoke': 'fa-smog',
    'Haze': 'fa-smog',
    'Dust': 'fa-smog',
    'Fog': 'fa-smog',
    'Sand': 'fa-smog',
    'Ash': 'fa-smog',
    'Squall': 'fa-wind',
    'Tornado': 'fa-poo-storm'
};

// City-specific Unsplash backgrounds
const cityBackgrounds = {
    'new york': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80',
    'london': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'tokyo': 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80',
    'paris': 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80',
    'sydney': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80'
};

// Mock weather data for demo purposes
const mockWeatherData = {
    'New York': {
        name: 'New York',
        main: { temp: 22, feels_like: 24, humidity: 65, pressure: 1013 },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind: { speed: 3.2 },
        visibility: 10000,
        sys: { country: 'US' },
        timezone: -14400
    },
    'London': {
        name: 'London',
        main: { temp: 15, feels_like: 13, humidity: 78, pressure: 1008 },
        weather: [{ main: 'Clouds', description: 'overcast clouds', icon: '04d' }],
        wind: { speed: 2.1 },
        visibility: 8000,
        sys: { country: 'GB' },
        timezone: 3600
    },
    'Tokyo': {
        name: 'Tokyo',
        main: { temp: 28, feels_like: 32, humidity: 70, pressure: 1015 },
        weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
        wind: { speed: 1.8 },
        visibility: 6000,
        sys: { country: 'JP' },
        timezone: 32400
    },
    'Paris': {
        name: 'Paris',
        main: { temp: 19, feels_like: 20, humidity: 55, pressure: 1012 },
        weather: [{ main: 'Clear', description: 'few clouds', icon: '02d' }],
        wind: { speed: 2.5 },
        visibility: 9000,
        sys: { country: 'FR' },
        timezone: 7200
    },
    'Sydney': {
        name: 'Sydney',
        main: { temp: 25, feels_like: 26, humidity: 60, pressure: 1018 },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind: { speed: 4.1 },
        visibility: 12000,
        sys: { country: 'AU' },
        timezone: 36000
    }
};

const mockForecastData = {
    'New York': [
        { day: 'Tomorrow', icon: '02d', high: 24, low: 18, description: 'Partly cloudy' },
        { day: 'Thursday', icon: '10d', high: 20, low: 15, description: 'Light rain' },
        { day: 'Friday', icon: '01d', high: 26, low: 20, description: 'Sunny' }
    ],
    'London': [
        { day: 'Tomorrow', icon: '04d', high: 17, low: 12, description: 'Cloudy' },
        { day: 'Thursday', icon: '09d', high: 14, low: 9, description: 'Showers' },
        { day: 'Friday', icon: '02d', high: 19, low: 13, description: 'Partly cloudy' }
    ],
    'Tokyo': [
        { day: 'Tomorrow', icon: '10d', high: 26, low: 22, description: 'Light rain' },
        { day: 'Thursday', icon: '11d', high: 23, low: 19, description: 'Thunderstorms' },
        { day: 'Friday', icon: '01d', high: 30, low: 25, description: 'Sunny' }
    ],
    'Paris': [
        { day: 'Tomorrow', icon: '01d', high: 22, low: 16, description: 'Sunny' },
        { day: 'Thursday', icon: '02d', high: 25, low: 18, description: 'Partly cloudy' },
        { day: 'Friday', icon: '09d', high: 18, low: 14, description: 'Rain' }
    ],
    'Sydney': [
        { day: 'Tomorrow', icon: '01d', high: 27, low: 21, description: 'Sunny' },
        { day: 'Thursday', icon: '02d', high: 24, low: 19, description: 'Partly cloudy' },
        { day: 'Friday', icon: '04d', high: 22, low: 17, description: 'Cloudy' }
    ]
};

// Initialize the dashboard
function initDashboard() {
    loadCitiesFromStorage();
    setupEventListeners();
    updateEmptyState();
    
    // Initialize with a default city if none exist
    if (cities.size === 0) {
        addCity('New York');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Unit toggle
    document.getElementById('unit-toggle').addEventListener('change', toggleTemperatureUnit);
    
    // Refresh all button
    document.getElementById('refreshAll').addEventListener('click', refreshAllCities);
    
    // View toggle buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => toggleView(e.target.dataset.view));
    });
    
    // Default city buttons
    document.querySelectorAll('.default-city-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            addCity(btn.getAttribute('data-city'));
        });
    });

    // Search input (Enter key)
    document.getElementById('cityInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchCity();
        }
    });

    // Search button
    document.getElementById('searchBtn').addEventListener('click', searchCity);

    // Modal close button
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);

    // Search input with debounce
    const searchInput = document.getElementById('cityInput');
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            showSearchSuggestions(searchInput.value);
        }, 300);
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideSearchSuggestions();
        }
    });

    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    document.getElementById('sortSelect').addEventListener('change', sortCities);
}

// Load cities from local storage
function loadCitiesFromStorage() {
    const savedCities = JSON.parse(localStorage.getItem('weatherDashboardCities')) || [];
    savedCities.forEach(city => cities.add(city));
}

// Save cities to local storage
function saveCitiesToStorage() {
    localStorage.setItem('weatherDashboardCities', JSON.stringify(Array.from(cities)));
}

// Update empty state visibility
function updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    emptyState.style.display = cities.size === 0 ? 'block' : 'none';
}

// Handle key press in search input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        searchCity();
    }
}

// Search for a city
function searchCity() {
    const input = document.getElementById('cityInput');
    const cityName = input.value.trim();
    
    if (cityName) {
        addCity(cityName);
        input.value = '';
        hideSearchSuggestions();
    }
}

// Show search suggestions
function showSearchSuggestions(query) {
    if (!query) {
        hideSearchSuggestions();
        return;
    }
    
    const suggestions = document.getElementById('searchSuggestions');
    suggestions.innerHTML = '';
    
    // Filter default cities based on query
    const defaultCities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney'];
    const filteredCities = defaultCities.filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredCities.length > 0) {
        suggestions.style.display = 'block';
        filteredCities.forEach(city => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = city;
            item.addEventListener('click', () => {
                document.getElementById('cityInput').value = city;
                hideSearchSuggestions();
                searchCity();
            });
            suggestions.appendChild(item);
        });
    } else {
        hideSearchSuggestions();
    }
}

// Hide search suggestions
function hideSearchSuggestions() {
    const suggestions = document.getElementById('searchSuggestions');
    suggestions.style.display = 'none';
}

// Add a city to the dashboard
async function addCity(cityName) {
    if (cities.has(cityName.toLowerCase()) || isLoading) return;

    const searchBtn = document.getElementById('searchBtn');
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    searchBtn.disabled = true;
    isLoading = true;

    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const weatherData = mockWeatherData[cityName] || generateMockData(cityName);
        const forecastData = mockForecastData[cityName] || generateMockForecast(cityName);

        cities.add(cityName.toLowerCase());
        saveCitiesToStorage();
        renderWeatherCard(weatherData, forecastData);
        updateEmptyState();
        
    } catch (error) {
        showError(`Failed to fetch weather data for ${cityName}`);
    } finally {
        searchBtn.innerHTML = '<i class="fas fa-plus"></i> Add City';
        searchBtn.disabled = false;
        isLoading = false;
    }

    renderAllCities();
}

// Generate mock data for unknown cities
function generateMockData(cityName) {
    const temps = [15, 18, 22, 25, 28, 30];
    const conditions = [
        { main: 'Clear', description: 'clear sky', icon: '01d' },
        { main: 'Clouds', description: 'few clouds', icon: '02d' },
        { main: 'Rain', description: 'light rain', icon: '10d' }
    ];
    
    const temp = temps[Math.floor(Math.random() * temps.length)];
    const weather = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
        name: cityName,
        main: {
            temp: temp,
            feels_like: temp + Math.floor(Math.random() * 4) - 2,
            humidity: 50 + Math.floor(Math.random() * 30),
            pressure: 1000 + Math.floor(Math.random() * 30)
        },
        weather: [weather],
        wind: { speed: 1 + Math.random() * 4 },
        visibility: 5000 + Math.floor(Math.random() * 7000),
        sys: { country: 'XX' },
        timezone: Math.floor(Math.random() * 46800) - 14400
    };
}

// Generate mock forecast for unknown cities
function generateMockForecast(cityName) {
    const days = ['Tomorrow', 'Thursday', 'Friday'];
    const icons = ['01d', '02d', '04d', '10d'];
    const descriptions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'];
    
    return days.map(day => ({
        day,
        icon: icons[Math.floor(Math.random() * icons.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        high: 20 + Math.floor(Math.random() * 15),
        low: 10 + Math.floor(Math.random() * 10)
    }));
}

// Render weather card with background and FA icon
function renderWeatherCard(data, forecast) {
    const grid = document.getElementById('citiesGrid');
    const weather = data.weather[0];
    const faIcon = faWeatherIcons[weather.main] || 'fa-cloud-sun';
    const temp = useCelsius ? Math.round(data.main.temp) : celsiusToFahrenheit(data.main.temp);
    const feelsLike = useCelsius ? Math.round(data.main.feels_like) : celsiusToFahrenheit(data.main.feels_like);
    const unit = useCelsius ? '°C' : '°F';
    const cityKey = data.name.toLowerCase();
    const bgUrl = cityBackgrounds[cityKey] || `https://source.unsplash.com/800x600/?${encodeURIComponent(data.name)},city,sky`;

    const card = document.createElement('div');
    card.className = 'weather-card';
    card.id = `city-${cityKey}`;
    card.style.backgroundImage = `url('${bgUrl}')`;

    card.innerHTML = `
        <div class="city-header">
            <h2 class="city-name">
                <i class="fas fa-location-dot"></i> ${data.name}, ${data.sys.country}
            </h2>
            <div class="city-actions">
                <button class="city-btn details-btn" title="View details" data-city="${data.name}">
                    <i class="fas fa-info"></i>
                </button>
                <button class="city-btn remove-btn" title="Remove city" data-city="${cityKey}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="current-weather">
            <div class="weather-icon"><i class="fas ${faIcon}"></i></div>
            <div class="weather-info">
                <div class="temperature">${temp}${unit}</div>
                <div class="weather-description">${weather.description}</div>
            </div>
        </div>
        <div class="weather-details">
            <div class="detail-item">
                <i class="fas fa-temperature-high"></i> Feels like: ${feelsLike}${unit}
            </div>
            <div class="detail-item">
                <i class="fas fa-tint"></i> Humidity: ${data.main.humidity}%
            </div>
            <div class="detail-item">
                <i class="fas fa-compress-alt"></i> Pressure: ${data.main.pressure} hPa
            </div>
            <div class="detail-item">
                <i class="fas fa-wind"></i> Wind: ${data.wind.speed.toFixed(1)} m/s
            </div>
        </div>
        <div class="forecast-section">
            <div class="forecast-title">3-Day Forecast</div>
            <div class="forecast-grid">
                ${forecast.map(item => {
                    const high = useCelsius ? item.high : celsiusToFahrenheit(item.high);
                    const low = useCelsius ? item.low : celsiusToFahrenheit(item.low);
                    const faFIcon = faWeatherIcons[item.description.split(' ')[0]] || 'fa-cloud-sun';
                    return `
                        <div class="forecast-item">
                            <div class="forecast-day">${item.day}</div>
                            <div class="forecast-icon"><i class="fas ${faFIcon}"></i></div>
                            <div class="forecast-temps">${high}${unit}/${low}${unit}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    // Remove old event listeners by recreating the node
    card.querySelector('.details-btn').addEventListener('click', () => showCityDetails(data.name));
    card.querySelector('.remove-btn').addEventListener('click', () => removeCity(cityKey));

    grid.appendChild(card);
    sortCities();
}

// Remove a city from the dashboard
function removeCity(cityName) {
    cities.delete(cityName);
    saveCitiesToStorage();
    const card = document.getElementById(`city-${cityName}`);
    
    if (card) {
        card.style.transform = 'translateX(-100%)';
        card.style.opacity = '0';
        setTimeout(() => {
            if (card.parentNode) {
                card.parentNode.removeChild(card);
            }
            updateEmptyState();
        }, 300);
    }

    renderAllCities();
}

// Show city details in modal
function showCityDetails(cityName) {
    const weatherData = mockWeatherData[cityName] || generateMockData(cityName);
    const forecastData = mockForecastData[cityName] || generateMockForecast(cityName);
    
    const modal = document.getElementById('cityModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const weather = weatherData.weather[0];
    const icon = weatherIcons[weather.icon] || '🌤️';
    
    const temp = useCelsius ? Math.round(weatherData.main.temp) : celsiusToFahrenheit(weatherData.main.temp);
    const feelsLike = useCelsius ? Math.round(weatherData.main.feels_like) : celsiusToFahrenheit(weatherData.main.feels_like);
    const unit = useCelsius ? '°C' : '°F';
    
    modalTitle.textContent = `${weatherData.name} Weather Details`;
    
    modalBody.innerHTML = `
        <div class="current-weather" style="text-align: center; margin-bottom: 20px;">
            <div class="weather-icon" style="font-size: 5rem;">${icon}</div>
            <div class="temperature" style="font-size: 3.5rem;">${temp}${unit}</div>
            <div class="weather-description" style="font-size: 1.5rem;">${weather.description}</div>
        </div>
        
        <div class="weather-details" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
            <div class="detail-item">
                <i class="fas fa-temperature-high"></i> Feels like: ${feelsLike}${unit}
            </div>
            <div class="detail-item">
                <i class="fas fa-tint"></i> Humidity: ${weatherData.main.humidity}%
            </div>
            <div class="detail-item">
                <i class="fas fa-compress-alt"></i> Pressure: ${weatherData.main.pressure} hPa
            </div>
            <div class="detail-item">
                <i class="fas fa-wind"></i> Wind: ${weatherData.wind.speed.toFixed(1)} m/s
            </div>
            <div class="detail-item">
                <i class="fas fa-eye"></i> Visibility: ${(weatherData.visibility / 1000).toFixed(1)} km
            </div>
            <div class="detail-item">
                <i class="fas fa-globe"></i> Timezone: GMT${weatherData.timezone >= 0 ? '+' : ''}${weatherData.timezone / 3600}
            </div>
        </div>
        
        <h3 style="margin-bottom: 15px; text-align: center;">5-Day Forecast</h3>
        <div class="detailed-forecast">
            ${forecastData.map(item => {
                const high = useCelsius ? item.high : celsiusToFahrenheit(item.high);
                const low = useCelsius ? item.low : celsiusToFahrenheit(item.low);
                return `
                    <div class="detailed-forecast-item">
                        <div class="forecast-day">${item.day}</div>
                        <div class="forecast-icon">${weatherIcons[item.icon] || '🌤️'}</div>
                        <div class="forecast-description">${item.description}</div>
                        <div class="forecast-temps">${high}${unit}/${low}${unit}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('cityModal');
    modal.style.display = 'none';
}

// Toggle temperature unit
function toggleTemperatureUnit() {
    useCelsius = !useCelsius;
    refreshAllCities();
}

// Convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

// Refresh all cities
function refreshAllCities() {
    const refreshBtn = document.getElementById('refreshAll');
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    setTimeout(() => {
        const citiesGrid = document.getElementById('citiesGrid');
        citiesGrid.innerHTML = '';
        
        Array.from(cities).forEach(city => {
            const cityName = city.charAt(0).toUpperCase() + city.slice(1);
            const weatherData = mockWeatherData[cityName] || generateMockData(cityName);
            const forecastData = mockForecastData[cityName] || generateMockForecast(cityName);
            renderWeatherCard(weatherData, forecastData);
        });
        
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh All';
        refreshBtn.disabled = false;
    }, 1000);

    renderAllCities();
}

// Sort cities
function sortCities() {
    const sortBy = document.getElementById('sortSelect').value;
    const citiesGrid = document.getElementById('citiesGrid');
    const cards = Array.from(citiesGrid.getElementsByClassName('weather-card'));
    
    cards.sort((a, b) => {
        if (sortBy === 'name') {
            const aName = a.querySelector('.city-name').textContent;
            const bName = b.querySelector('.city-name').textContent;
            return aName.localeCompare(bName);
        } else if (sortBy === 'temperature') {
            const aTemp = parseInt(a.querySelector('.temperature').textContent);
            const bTemp = parseInt(b.querySelector('.temperature').textContent);
            return aTemp - bTemp;
        }
        // For "recently added", keep original order
        return 0;
    });
    
    // Remove all cards and re-add in sorted order
    cards.forEach(card => citiesGrid.appendChild(card));
}

// Toggle view between grid and list
function toggleView(view) {
    currentView = view;
    const container = document.getElementById('citiesContainer');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    // Update active button
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Update container class
    container.className = `cities-container ${view}-view`;
}

// Show error message
function showError(message) {
    const grid = document.getElementById('citiesGrid');
    const error = document.createElement('div');
    error.className = 'error';
    error.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    grid.appendChild(error);
    
    setTimeout(() => {
        if (error.parentNode) {
            error.parentNode.removeChild(error);
        }
    }, 5000);
}

// Auto-update weather data every 5 minutes
setInterval(() => {
    if (cities.size > 0) {
        refreshAllCities();
    }
}, 300000);

// Initialize dashboard when page loads
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('weatherTheme');
    if (savedTheme) setTheme(savedTheme);
    else autoTheme();
    initDashboard();
});

// Close modal if clicked outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('cityModal');
    if (event.target === modal) {
        closeModal();
    }
});

function renderAllCities() {
    const citiesGrid = document.getElementById('citiesGrid');
    citiesGrid.innerHTML = '';
    Array.from(cities).forEach(cityKey => {
        // Capitalize first letter for display
        const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
        const weatherData = mockWeatherData[cityName] || generateMockData(cityName);
        const forecastData = mockForecastData[cityName] || generateMockForecast(cityName);
        renderWeatherCard(weatherData, forecastData);
    });
    sortCities();
}

// Theme support
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        localStorage.setItem('weatherTheme', 'dark');
        document.getElementById('themeToggleBtn').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('weatherTheme', 'light');
        document.getElementById('themeToggleBtn').innerHTML = '<i class="fas fa-moon"></i>';
    }
}
function toggleTheme() {
    if (document.body.classList.contains('dark')) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}
function autoTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', autoTheme);

// Loading state for grid
function showLoading() {
    const grid = document.getElementById('citiesGrid');
    grid.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>`;
}