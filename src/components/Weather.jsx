// src/components/Weather.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BsSun, BsCloud, BsCloudRain, BsCloudSnow, BsCloudFog2, BsSearch } from 'react-icons/bs';
import { WiStrongWind } from 'react-icons/wi';

const Weather = () => {
    // State for weather data, location name, loading, errors, and search input
    const [weatherData, setWeatherData] = useState(null);
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState(''); // State for the search bar

    // Helper to map WMO weather codes to icons and descriptions
    const getWeatherInfo = (code) => {
        switch (code) {
            case 0: return { icon: <BsSun />, description: 'Clear sky' };
            case 1: case 2: case 3: return { icon: <BsCloud />, description: 'Cloudy' };
            case 45: case 48: return { icon: <BsCloudFog2 />, description: 'Fog' };
            case 51: case 53: case 55: case 61: case 63: case 65: case 80: case 81: case 82: return { icon: <BsCloudRain />, description: 'Rain' };
            case 71: case 73: case 75: case 77: case 85: case 86: return { icon: <BsCloudSnow />, description: 'Snow' };
            default: return { icon: <BsSun />, description: 'Clear' };
        }
    };

    // Generic function to fetch weather data given latitude and longitude
    const fetchWeather = async (lat, lon, cityName = null) => {
        setLoading(true);
        setError(null);
        try {
            // If no city name is provided, use reverse geocoding to find it
            if (!cityName) {
                const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
                const geoResponse = await axios.get(geoApiUrl);
                setLocation(geoResponse.data.city || geoResponse.data.locality || '');
            } else {
                setLocation(cityName);
            }

            // Fetch the weather data from Open-Meteo
            const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`;
            const weatherResponse = await axios.get(weatherApiUrl);
            setWeatherData(weatherResponse.data);
            //eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to fetch weather data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle the city search
    const handleSearch = async (e) => {
        e.preventDefault(); // Prevent form from reloading the page
        if (!searchInput) return; // Do nothing if search is empty

        setLoading(true);
        setError(null);
        try {
            // Use Open-Meteo's geocoding API to find coordinates for the city
            const geocodingApiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${searchInput}&count=1&language=en&format=json`;
            const response = await axios.get(geocodingApiUrl);

            if (response.data.results && response.data.results.length > 0) {
                const { latitude, longitude, name } = response.data.results[0];
                fetchWeather(latitude, longitude, name);
            } else {
                setError(`Could not find location: ${searchInput}`);
                setLoading(false);
            }
            //eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError('Failed to find location. Please check the city name.');
            setLoading(false);
        }
    };

    // useEffect for initial load to get user's geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                //eslint-disable-next-line no-unused-vars
                (err) => {
                    setError('Geolocation permission denied. Please search for a city.');
                    setLoading(false); // Stop loading if geolocation fails
                }
            );
        } else {
            setError('Geolocation is not supported. Please use the search bar.');
            setLoading(false);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    const renderContent = () => {
        if (loading) {
            return <div className="text-white text-2xl animate-pulse">Loading weather data...</div>;
        }

        if (error) {
            return <div className="text-red-300 bg-red-900/50 p-4 rounded-md">{error}</div>;
        }

        if (!weatherData) {
            return <div className="text-white text-xl">Search for a city to get weather information.</div>;
        }

        const { temperature_2m: temperature, weather_code, wind_speed_10m: windSpeed } = weatherData.current;
        const { icon, description } = getWeatherInfo(weather_code);

        return (
            <div className="bg-white/20 p-8 rounded-xl shadow-lg backdrop-blur-md text-white w-full max-w-md text-center transition-all duration-500">
                <h1 className="text-4xl font-bold mb-2">{location}</h1>
                <p className="text-lg mb-6">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                
                <div className="flex items-center justify-center text-8xl mb-4">
                    {icon}
                </div>

                <p className="text-xl mb-4">{description}</p>
                
                <div className="text-7xl font-extrabold mb-4">
                    {Math.round(temperature)}°C
                </div>

                <div className="flex justify-center items-center text-lg">
                    <WiStrongWind className="mr-2 text-2xl" />
                    <span>Wind: {windSpeed} km/h</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col items-center p-4 space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-md">
                <div className="relative">
                    <input 
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search for a city..."
                        className="w-full bg-white/20 text-white placeholder-gray-300 border border-white/30 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/30 hover:bg-white/50 rounded-full transition-colors">
                        <BsSearch className="text-white text-xl" />
                    </button>
                </div>
            </form>

            {/* Weather Display */}
            {renderContent()}
        </div>
    );
};

export default Weather;


















// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { BsSun, BsCloud, BsCloudRain, BsCloudSnow, BsCloudFog2 } from 'react-icons/bs';
// import { WiStrongWind } from 'react-icons/wi';

// const Weather = () => {
//     const [weatherData, setWeatherData] = useState(null);
//     const [location, setLocation] = useState('');
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Helper function to map WMO weather codes to icons and descriptions
//     const getWeatherInfo = (code) => {
//         switch (code) {
//             case 0: return { icon: <BsSun />, description: 'Clear sky' };
//             case 1:
//             case 2:
//             case 3: return { icon: <BsCloud />, description: 'Cloudy' };
//             case 45:
//             case 48: return { icon: <BsCloudFog2 />, description: 'Fog' };
//             case 51:
//             case 53:
//             case 55:
//             case 61:
//             case 63:
//             case 65:
//             case 80:
//             case 81:
//             case 82: return { icon: <BsCloudRain />, description: 'Rain' };
//             case 71:
//             case 73:
//             case 75:
//             case 77:
//             case 85:
//             case 86: return { icon: <BsCloudSnow />, description: 'Snow' };
//             default: return { icon: <BsSun />, description: 'Clear' };
//         }
//     };

//     useEffect(() => {
//         // Function to fetch weather data from API
//         const fetchWeather = async (lat, lon) => {
//             try {
//                 // First, get the city name using reverse geocoding
//                 const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
//                 const geoResponse = await axios.get(geoApiUrl);
//                 setLocation(geoResponse.data.city || geoResponse.data.locality || '');

//                 // Then, fetch the weather data
//                 const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`;
//                 const weatherResponse = await axios.get(weatherApiUrl);
//                 setWeatherData(weatherResponse.data);
//             // eslint-disable-next-line no-unused-vars
//             } catch (err) {
//                 setError('Failed to fetch weather data. Please try again.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         // Get user's current location
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const { latitude, longitude } = position.coords;
//                     fetchWeather(latitude, longitude);
//                 },
//                 // eslint-disable-next-line no-unused-vars
//                 (err) => {
//                     setError('Geolocation permission denied. Please enable it in your browser settings.');
//                     setLoading(false);
//                 }
//             );
//         } else {
//             setError('Geolocation is not supported by this browser.');
//             setLoading(false);
//         }
//     }, []); // Empty dependency array ensures this runs only once on mount

//     if (loading) {
//         return <div className="text-white text-2xl">Loading weather data...</div>;
//     }

//     if (error) {
//         return <div className="text-red-400 bg-white/20 p-4 rounded-md">{error}</div>;
//     }

//     if (!weatherData) {
//         return null;
//     }

//     const { temperature_2m: temperature, weather_code, wind_speed_10m: windSpeed } = weatherData.current;
//     const { icon, description } = getWeatherInfo(weather_code);

//     return (
//         <div className="bg-white/30 p-8 rounded-xl shadow-lg backdrop-blur-md text-white w-full max-w-md mx-4 text-center">
//             <h1 className="text-4xl font-bold mb-2">{location}</h1>
//             <p className="text-lg mb-6">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            
//             <div className="flex items-center justify-center text-8xl mb-4">
//                 {icon}
//             </div>

//             <p className="text-xl mb-4">{description}</p>
            
//             <div className="text-7xl font-extrabold mb-4">
//                 {Math.round(temperature)}°C
//             </div>

//             <div className="flex justify-center items-center text-lg">
//                 <WiStrongWind className="mr-2 text-2xl" />
//                 <span>Wind: {windSpeed} km/h</span>
//             </div>
//         </div>
//     );
// };

// export default Weather;