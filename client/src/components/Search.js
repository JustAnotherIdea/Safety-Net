import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Search.css';
import { Link } from 'react-router-dom';

function Search() {
  const storedPlaceId = localStorage.getItem('place_id');
  const storedAddress = localStorage.getItem('address');
  const storedLat = localStorage.getItem('lat');
  const storedLng = localStorage.getItem('lng');
  const [placeId, setPlaceId] = useState(storedPlaceId || '');
  let lastPlaceId = placeId;
  const [address, setAddress] = useState(storedAddress || '');
  const [lat, setLat] = useState(storedLat || '');
  const [lng, setLng] = useState(storedLng || '');
  const [maxDistance, setMaxDistance] = useState(50);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [resources, setResources] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const categories = ['Food', 'Housing', 'Health', 'Education']; 
  const fetchResources = async () => {
    if (loading) return; // Avoid fetching if already loading
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/resources`, {
        params: { query, category: selectedCategory, page: currentPage, limit: 10, lat, lng, maxDistance }
      });
      // Check and only append new unique resources
      setResources(prevResources => {
        const newResources = response.data.filter(res =>
          !prevResources.some(existingRes => existingRes.id === res.id)
        );
        return [...prevResources, ...newResources];
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  let typingTimer; // Declare a timer variable outside the function
  const typingDelay = 500; // Delay in milliseconds (adjust as needed)

  const handleInputChange = async (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);

    // Clear the previous timer if the user keeps typing
    clearTimeout(typingTimer);

    // Set a new timer that will wait before making the API call
    typingTimer = setTimeout(async () => {
      if (inputValue) { // Ensure the input is not empty
        const response = await axios.get(`http://localhost:3000/api/places/autocomplete`, {
          params: { input: inputValue }
        });
        setPlaces(response.data);
      }
    }, typingDelay);
  };

  const getLocation = async () => {
    if (placeId !== lastPlaceId) {
      const response = await axios.get(`http://localhost:3000/api/places/location`, {
        params: { place_id: placeId }
      });
      const details = {
        address: response.data.result.formatted_address,
        lat: response.data.result.geometry.location.lat,
        lng: response.data.result.geometry.location.lng
      };
      setAddress(details.address);
      setLat(details.lat);
      setLng(details.lng);
      localStorage.setItem('address', details.address);
      localStorage.setItem('lat', details.lat);
      localStorage.setItem('lng', details.lng);
    }
  }
  const handleSearch = () => {
    getLocation();
    setCurrentPage(1); 
    setResources([]); // Reset resources for new search
    fetchResources(); // Fetch resources with the current page
  };
  // Scroll detection logic
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 10 &&
        !loading
      ) {
        setCurrentPage(prevPage => prevPage + 1); // Load next page
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Cleanup
  }, [loading]);
  useEffect(() => {
    fetchResources(); // Fetch resources when current page, query, or category change
  }, [currentPage, query, selectedCategory]);
  return (
    <div className="search-container">
      <h1>Search for Resources</h1>
      <input
        type="text"
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter search query"
      />
      <input
        type="text"
        className="location-input"
        value={address}
        onChange={handleInputChange}
        placeholder={address !== '' ? address : 'Enter address'}
      />
      {/* Display autocomplete suggestions */}
      {places.map(place => (
        <div key={place.place_id} onClick={() => setPlaceId(place.place_id)}>{place.description}</div>
      ))}
      <input
        type="number"
        className="distance-input"
        value={maxDistance}
        onChange={(e) => setMaxDistance(e.target.value)}
        placeholder="Max Distance (miles)"
      />
      <select value={selectedCategory} onChange={(e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // Reset page when category changes
        setResources([]); // Reset resources on category change
      }}>
        <option value="">All Categories</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <button className="search-button" onClick={handleSearch}>Search</button>
      <div className="results-container">
        {resources.map(resource => (
          <div key={resource.id} className="resource-card">
            <Link to={`/resource/${resource.id}`}>{resource.name}</Link>
            <p>{resource.description}</p>
          </div>
        ))}
      </div>
      {loading && <p>Loading more resources...</p>} {/* Show loading text */}
    </div>
  );
}
export default Search;
