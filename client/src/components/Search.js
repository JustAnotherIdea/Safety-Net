import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResourceCard from './ResourceCard.js';
import SearchForm from './SearchForm.js';
import baseUrl from '../getBaseUrl.js';
import { debounce } from 'lodash'; // Add this import

function Search() {
  const storedPlaceId = localStorage.getItem('place_id');
  const storedAddress = localStorage.getItem('address');
  const storedLat = localStorage.getItem('lat');
  const storedLng = localStorage.getItem('lng');
  const [placeId, setPlaceId] = useState(storedPlaceId || '');
  const [lastPlaceId, setLastPlaceId] = useState(storedPlaceId || '');
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
  const [hasMore, setHasMore] = useState(true);

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
    if (loading || !hasMore) return; // Avoid fetching if already loading or no more resources
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
        
        // If no new resources are returned, we've reached the end
        if (newResources.length === 0) {
          setHasMore(false);
        }
        
        return [...prevResources, ...newResources];
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
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
      setLastPlaceId(placeId);
    }
  }

  const handleSearch = () => {
    console.log('Searching...');
    setCurrentPage(1);
    //setResources([]);
    setHasMore(true); // Reset hasMore when starting a new search
    fetchResources(); // Fetch resources with the current page
  };

  // Debounced scroll handler
  const debouncedHandleScroll = debounce(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 150 >= document.documentElement.scrollHeight &&
      !loading &&
      hasMore
    ) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  }, 200); // Adjust the debounce delay as needed

  // Scroll detection logic
  useEffect(() => {
    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      debouncedHandleScroll.cancel(); // Cancel any pending debounce on unmount
    };
  }, [loading, hasMore]);

  useEffect(() => {
    handleSearch(); // Fetch resources when current page, query, or category change
  }, [currentPage, query, selectedCategory, selectedSubcategory, lat, lng, maxDistance]);

  useEffect(() => {
    if (placeId !== lastPlaceId) {
      getLocation();
      setResources([]); // Reset resources when placeId changes
      setHasMore(true); // Reset hasMore when placeId changes
      setCurrentPage(1); // Reset current page when placeId changes
      // Remove this line: fetchResources(); // Fetch resources with the current page
    }
  }, [placeId]);

  return (
    <div className="w-full mx-auto flex flex-col min-h-screen">
      {/* Top Search Form (visible on large screens) */}
      <div className="hidden lg:block fixed top-16 left-0 right-0 bg-slate-200 shadow-lg z-10">
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-2">
          {resources.map(resource => (
            <ResourceCard key={resource.id} id={resource.id} />
          ))}
        </div>

        {/* Loading State */}
        {loading && <p className="text-center mb-4 text-gray-600">Loading more resources...</p>}
        
        {/* End of Resources Message */}
        {!loading && !hasMore && resources.length > 0 && (
          <p className="text-center mb-4 text-gray-600">No more resources to load.</p>
        )}
      </div>

      {/* Bottom Search Form (visible on small screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-200 shadow-lg z-10">
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