import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResourceCard from './ResourceCard.js';

function Search() {
  const storedPlaceId = localStorage.getItem('place_id');
  const storedAddress = localStorage.getItem('address');
  const storedLat = localStorage.getItem('lat');
  const storedLng = localStorage.getItem('lng');
  const [placeId, setPlaceId] = useState(storedPlaceId || '');
  let lastPlaceId = storedPlaceId;
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
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch resources from the API
  const fetchResources = async () => {
    if (loading) return; // Avoid fetching if already loading
    setLoading(true);
    try {
      const response = await axios.get(`http://192.168.0.100:3000/api/resources`, {
        params: {
          query,
          category: selectedCategory,
          page: currentPage,
          limit: 10,
          latitude: Number(lat), // Ensure latitude is a number
          longitude: Number(lng), // Ensure longitude is a number
          maxDistance: parseInt(maxDistance, 10) // Ensure maxDistance is a number
        }
      });
  
      // Check and only append new unique resources
      setResources(prevResources => {
        const newResources = response.data.filter(res =>
          !prevResources.some(existingRes => existingRes.id === res.id)
        );
        
        // Combine previous and new resources
        const combinedResources = [...prevResources, ...newResources];
        
        // If combined length exceeds 16, remove the older resources
        if (combinedResources.length > 16) {
          return combinedResources.slice(combinedResources.length - 16);
        }
  
        return combinedResources;
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };
  

  let typingTimer; // Declare a timer variable outside the function
  const typingDelay = 500; // Delay in milliseconds (adjust as needed)

  const handleLocationInputChange = async (e) => {
    const inputValue = e.target.value;
    setAddress(inputValue);
    setShowSuggestions(true);

    // Clear the previous timer if the user keeps typing
    clearTimeout(typingTimer);

    // Set a new timer that will wait before making the API call
    typingTimer = setTimeout(async () => {
      if (inputValue) { // Ensure the input is not empty
        const response = await axios.get(`http://192.168.0.100:3000/api/places/autocomplete`, {
          params: { input: inputValue }
        });
        setPlaces(response.data);
      }
    }, typingDelay);
  };

  const handlePlaceClick = (place) => {
    setPlaceId(place.place_id);
    setAddress(place.description);
    localStorage.setItem('address', place.description);
    setShowSuggestions(false); // Hide suggestions when user selects one
  };

  const getLocation = async () => {
    if (placeId !== lastPlaceId && placeId) {
      const response = await axios.get(`http://192.168.0.100:3000/api/places/location`, {
        params: { place_id: placeId }
      });
      const details = {
        address: response.data.address,
        lat: response.data.lat,
        lng: response.data.lng
      };
      setLat(details.lat);
      setLng(details.lng);
      localStorage.setItem('lat', details.lat);
      localStorage.setItem('lng', details.lng);
      lastPlaceId = placeId;
    }
  }

  const handleSearch = () => {
    setCurrentPage(1);
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
    handleSearch(); // Fetch resources when current page, query, or category change
  }, [currentPage, query, selectedCategory, lat, lng, maxDistance]);

  useEffect(() => {
    if (placeId !== lastPlaceId) {
      getLocation();
      setResources([]); // Reset resources when placeId changes
    }
  }, [placeId]);

  return (
    <div className="w-full mx-auto p-6">
      
      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          className="p-2 border rounded focus:outline-none focus:border-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query"
        />
        <input
          type="text"
          className="p-2 border rounded focus:outline-none focus:border-blue-500"
          value={address}
          onChange={handleLocationInputChange}
          placeholder={address !== '' ? address : 'Enter address'}
        />
        <input
          type="number"
          className="p-2 border rounded focus:outline-none focus:border-blue-500"
          value={maxDistance}
          onChange={(e) => setMaxDistance(e.target.value)}
          placeholder="Max Distance (miles)"
        />
      </div>

      {/* Category Selector */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1); // Reset page when category changes
            setResources([]); // Reset resources on category change
          }}
          className="p-2 border rounded w-full md:w-auto focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full md:w-auto"
      >
        Search
      </button>

      {/* Display autocomplete suggestions */}
      {showSuggestions && (
        <div className="my-4">
          {places.map(place => (
            <div 
              key={place.place_id} 
              onClick={() => handlePlaceClick(place)}
              className="p-2 bg-gray-100 border-b hover:bg-gray-200 cursor-pointer"
            >
              {place.description}
            </div>
          ))}
        </div>
      )}

      {/* Resource Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {resources.map(resource => (
          <ResourceCard key={resource.id} id={resource.id} />
        ))}
      </div>

      {/* Loading State */}
      {loading && <p className="text-center mt-4 text-gray-600">Loading more resources...</p>}
    </div>
  );
}

export default Search;
