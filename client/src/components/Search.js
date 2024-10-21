import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ResourceCard from './ResourceCard.js';
import SearchForm from './SearchForm.js';
import baseUrl from '../getBaseUrl.js';
import { debounce } from 'lodash'; // Add this import
import CategorySelectionPanel from './CategorySelectionPanel';
import { useLocation } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';

function Search() {
  const storedPlaceId = localStorage.getItem('place_id');
  const storedAddress = localStorage.getItem('address');
  const storedLat = localStorage.getItem('lat');
  const storedLng = localStorage.getItem('lng');
  const shouldAskForLocation = localStorage.getItem('shouldAskForLocation') !== 'false';
  const [hasAskedForLocation, setHasAskedForLocation] = useState(storedAddress ? true : false);
  const [placeId, setPlaceId] = useState(storedPlaceId || '');
  const [lastPlaceId, setLastPlaceId] = useState(storedPlaceId || '');
  const [address, setAddress] = useState(storedAddress || '');
  const [lat, setLat] = useState(storedLat || '');
  const [lng, setLng] = useState(storedLng || '');
  const [maxDistance, setMaxDistance] = useState(50);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [resources, setResources] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const location = useLocation();
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log("baseurl", baseUrl);
      const response = await axios.get(`http://${baseUrl}:3000/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Add this new function to reset the search state
  const resetSearch = () => {
    setResources([]);
    setCurrentPage(1);
    setHasMore(true);
    window.scrollTo({
      top: 16,
    });
  };

  // Modify the fetchResources function
  const fetchResources = async (page = 1) => {
    if (loading || (!hasMore && page !== 1)) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://${baseUrl}:3000/api/resources`, {
        params: {
          query,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          page: page,
          limit: 10,
          latitude: Number(lat),
          longitude: Number(lng),
          maxDistance: parseInt(maxDistance, 10)
        }
      });

      setResources(prevResources => {
        const newResources = page === 1 
          ? response.data 
          : [...prevResources, ...response.data.filter(res => !prevResources.some(existingRes => existingRes.id === res.id))];
        
        setHasMore(response.data.length === 10);
        return newResources;
      });
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User location requested", position);
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setAddress('Current Location');
          setHasAskedForLocation(true);
          localStorage.setItem('lat', position.coords.latitude);
          localStorage.setItem('lng', position.coords.longitude);
          localStorage.setItem('address', 'Current Location');
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser");
    }
  };

  const warnAboutLocation = () => {
    alert("Search results will be limited without a location. Enter a location at any time to search nearby resources.");
  }

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
      setAddress(details.address);
      localStorage.setItem('lat', details.lat);
      localStorage.setItem('lng', details.lng);
      localStorage.setItem('address', details.address);
      localStorage.setItem('place_id', placeId);
      setLastPlaceId(placeId);
    }
  }

  // Modify the handleSearch function
  const handleSearch = () => {
    console.log('Searching...');
    fetchResources(1);
  };

  // Add this function to check if content is overflowing
  const checkOverflow = () => {
    console.log('resultsRef', resultsRef);
    if (resultsRef.current) {
      const isOverflowing = resultsRef.current.scrollHeight > resultsRef.current.clientHeight;
      console.log('isOverflowing', isOverflowing);
      console.log('resultsRef.current', resultsRef.current);
      return isOverflowing;
    }
  };

  // Debounced scroll handler
  const debouncedHandleScroll = debounce(() => {
    if (window.scrollY > 0 && checkOverflow()) {
      setShowScrollIndicator(false);
    }

    if (
      window.innerHeight + document.documentElement.scrollTop + 150 >= document.documentElement.scrollHeight &&
      !loading &&
      hasMore
    ) {
      fetchResources(currentPage + 1);
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

  // Add this useEffect to check for overflow when resources change
  useEffect(() => {
    checkOverflow();
  }, [resources]);

  // Modify this useEffect to reset and fetch when search parameters change
  useEffect(() => {
    fetchResources(1);
  }, [query, selectedCategory, selectedSubcategory, lat, lng, maxDistance]);

  // Remove the fetchResources call from this useEffect
  useEffect(() => {
    if (placeId !== lastPlaceId) {
      getLocation();
      resetSearch();
    }
  }, [placeId, lastPlaceId]);

  // Add this function to determine if the CategorySelectionPanel should be shown
  const showCategorySelectionPanel = !selectedCategory && !query.trim();

  useEffect(() => {
    if (location.state?.clearCategory) {
      setSelectedCategory('');
      setSelectedSubcategory('');
      // Clear the state to prevent clearing on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="w-full mx-auto flex flex-col">
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
      <div className="flex-grow overflow-y-auto lg:pt-20 pb-24 lg:pb-0 relative">
        {showCategorySelectionPanel ? (
          <CategorySelectionPanel
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setSelectedSubcategory={setSelectedSubcategory}
          />
        ) : (
          <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-2">
            {resources.map(resource => (
              <ResourceCard key={resource.id} id={resource.id} />
            ))}
          </div>
        )}

        {/* Scroll down indicator */}
        {showScrollIndicator && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-bounce">
            <span>Scroll down for more</span>
            <FaChevronDown />
          </div>
        )}

        {/* Loading State */}
        {loading && <p className="text-center mb-4 text-gray-600">Loading more resources...</p>}
        
        {/* End of Resources Message */}
        {!loading && !hasMore && resources.length > 0 && (
          <p className="text-center mb-4 text-gray-600">No more resources to load.</p>
        )}

        {/* No Results Message */}
        {!loading && !hasMore && resources.length === 0 && (
          <p className="text-center mb-4 text-gray-600">No resources found.</p>
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
      {!hasAskedForLocation && shouldAskForLocation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-80 w-full">
            <p className="text-lg font-semibold mb-4 text-center">Can we access your location to show you nearby resources?</p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={requestUserLocation}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Yes, share my location
              </button>
              <button
                onClick={() => setHasAskedForLocation(true)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                I'll enter a location manually
              </button>
              <button
                onClick={() => {
                  setHasAskedForLocation(true);
                  localStorage.setItem('shouldAskForLocation', 'false');
                  warnAboutLocation();
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                No, don't share my location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
