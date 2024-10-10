import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResourceCard from './ResourceCard.js';
import SearchForm from './SearchForm.js';
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
    setCurrentPage(1);
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
    <div className="mt-16 w-full mx-auto flex flex-col min-h-screen">
      {/* Top Search Form (visible on large screens) */}
      <div className="hidden lg:block fixed top-16 left-0 right-0 bg-white shadow-lg z-10">
        <SearchForm 
          query={query}
          setQuery={setQuery}
          address={address}
          setAddress={setAddress}
          placeId={placeId}
          setPlaceId={setPlaceId}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubcategory={selectedSubcategory}
          setSelectedSubcategory={setSelectedSubcategory}
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          categories={categories}
          onSearch={handleSearch}
        />
      </div>

      {/* Resource Results */}
      <div className="flex-grow overflow-y-auto lg:pt-24 pb-24 lg:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {resources.map(resource => (
            <ResourceCard key={resource.id} id={resource.id} />
          ))}
        </div>

        {/* Loading State */}
        {loading && <p className="text-center mb-4 text-gray-600">Loading more resources...</p>}
      </div>

      {/* Bottom Search Form (visible on small screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
        <SearchForm 
          query={query}
          setQuery={setQuery}
          address={address}
          setAddress={setAddress}
          placeId={placeId}
          setPlaceId={setPlaceId}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubcategory={selectedSubcategory}
          setSelectedSubcategory={setSelectedSubcategory}
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          categories={categories}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}

export default Search;