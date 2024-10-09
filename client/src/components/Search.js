import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResourceCard from './ResourceCard.js';
import baseUrl from '../getBaseUrl.js';

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
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [resources, setResources] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = {
    "Housing": [
      "Shelters",
      "Low income housing",
      "Hostels",
      "Camping sites",
      "Public restroom map",
      "Public shower map",
      "Disaster shelters"
    ],
    "Transportation": [
      "Public transportation schedules and routes",
      "Transportation apps"
    ],
    "Food & Water": [
      "Soup kitchens",
      "Food stamps",
      "Food banks",
      "Water fountain map",
      "Public restroom map"
    ],
    "Financial Assistance": [
      "Unemployment",
      "Disability",
      "Food Stamps",
      "Rent/Bill aid programs",
      "Social Security"
    ],
    "Mental Health": [
      "Crisis hotlines",
      "Local mental health clinics and therapists",
      "Online counseling and therapy"
    ],
    "Addiction & Abuse": [
      "Crisis hotlines",
      "Local shelters and rehab centers",
      "Counseling and therapy"
    ],
    "Legal Help & Documents": [
      "Social Security Card",
      "Birth certificate",
      "ID/Drivers License",
      "Citizenship",
      "Legal advice",
      "Legal aid societies"
    ],
    "Jobs": [
      "Temp agencies",
      "Job listings",
      "Soft skills"
    ],
    "Education": [
      "Free GED resources",
      "Free educational books",
      "Free online courses",
      "Free certifications",
      "Free and low cost college"
    ],
    "Safety Tips": [
      "Camping safety tips",
      "Urban camping/shelter tips",
      "Hitchhiking safety tips"
    ],
    "Health & Hygiene": [
      "Personal hygiene tips",
      "Access to public showers",
      "Dental care resources",
      "Free or low-cost health clinics",
      "Vaccination services",
      "Sexual health and contraception",
      "Basic first aid",
      "Hygiene products distribution centers",
      "Skincare and wound care",
      "Public restroom locations"
    ]
  }
  

  // Fetch resources from the API
  const fetchResources = async () => {
    if (loading) return; // Avoid fetching if already loading
    setLoading(true);
    try {
      const response = await axios.get(`http://${baseUrl}:3000/api/resources`, {
        params: {
          query,
          category: selectedCategory,
          subcategory: selectedSubcategory,
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
    if (!inputValue) {
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);

    // Clear the previous timer if the user keeps typing
    clearTimeout(typingTimer);

    // Set a new timer that will wait before making the API call
    typingTimer = setTimeout(async () => {
      if (inputValue) { // Ensure the input is not empty
        const response = await axios.get(`http://${baseUrl}:3000/api/places/autocomplete`, {
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
      const response = await axios.get(`http://${baseUrl}:3000/api/places/location`, {
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
    console.log('Searching...');
    //setCurrentPage(1);
    //setResources([]);
    fetchResources(); // Fetch resources with the current page
  };

  // Scroll detection logic
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 150 >= document.documentElement.scrollHeight &&
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
  }, [currentPage, query, selectedCategory, selectedSubcategory, lat, lng, maxDistance]);

  useEffect(() => {
    if (placeId !== lastPlaceId) {
      getLocation();
      setResources([]); // Reset resources when placeId changes
    }
  }, [placeId]);

  return (
    <div className="w-full mx-auto">
      
      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3">
        <input
          type="text"
          className="p-2 border-l border-b border-slate-400 bg-slate-200 col-span-3 focus:outline-none focus:border-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search query"
        />
        <div className="col-span-2">
          <input
            type="text"
            className="p-2 border-l border-b border-slate-400 bg-slate-200 w-full focus:outline-none focus:border-blue-500"
            value={address}
            onChange={handleLocationInputChange}
            placeholder={address !== '' ? address : 'Enter address'}
          />
          
          {/* Display autocomplete suggestions */}
          {showSuggestions && (
            <div className="absolute left-0 w-full">
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
        </div>

        {/* Category Selector */}
        <div className={`${selectedCategory !== '' ? "col-span-2" : "col-span-4"} w-full`}>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory(''); // Reset subcategory
              setResources([]);
            }}
            className="p-2 border-l border-b border-slate-400 h-10 w-full bg-slate-400 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {Object.keys(categories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Selector (only visible when a category is selected) */}
        {selectedCategory && (
          <div className="w-full col-span-2">
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="p-2 border-l border-b border-slate-400 h-10 w-full bg-slate-400 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Subcategories</option>
              {categories[selectedCategory].map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Max Distance Input */}
        <input
          type="number"
          className="p-2 border-l border-b border-slate-400 bg-slate-200 h-10 col-start-5 focus:outline-none focus:border-blue-500"
          value={maxDistance}
          onChange={(e) => setMaxDistance(e.target.value)}
          placeholder="Max Distance (miles)"
        />

      </div>

      {/* Resource Results */}
      <div className="pt-2 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2">
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
