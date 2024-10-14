import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditResource from './EditResource.js';
import ModSearchForm from './ModeratorSearchForm.js';
import baseUrl from '../getBaseUrl.js';
import { debounce } from 'lodash'; // Add this import
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa'; // Add this import

function AdminModeration() {
  const storedPlaceId = localStorage.getItem('moderator_place_id');
  const storedAddress = localStorage.getItem('moderator_address');
  const storedLat = localStorage.getItem('moderator_lat');
  const storedLng = localStorage.getItem('moderator_lng');
  const token = localStorage.getItem('token');
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
  const [status, setStatus] = useState('pending');
  const [resources, setResources] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getUserRole = () => {
    if (!token) return null;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the JWT to get user info
      console.log("user role", decoded.role);
      return decoded.role; // Extract role from token
    } catch (e) {
      console.error('Invalid token:', e);
      return null;
    }
  };

  const userRole = getUserRole();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
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
      const response = await axios.get(`http://${baseUrl}:3000/api/moderated-resources`, {
        params: {
          query,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          page: page,
          limit: 10,
          latitude: Number(lat),
          longitude: Number(lng),
          maxDistance: parseInt(maxDistance, 10),
          status: status
        }
      });

      console.log('Response data:', response.data);

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
      localStorage.setItem('moderator_lat', details.lat);
      localStorage.setItem('moderator_lng', details.lng);
      localStorage.setItem('moderator_address', details.address);
      localStorage.setItem('moderator_place_id', placeId);
      setLastPlaceId(placeId);
    }
  }

  // Modify the handleSearch function
  const handleSearch = () => {
    console.log('Searching...');
    fetchResources(1);
  };

  // Debounced scroll handler
  const debouncedHandleScroll = debounce(() => {
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

  // Modify this useEffect to fetch resources on initial load
  useEffect(() => {
    resetSearch();
    fetchResources(1);
    console.log('Fetching resources on initial load');
  }, []); // Empty dependency array to run only on mount

  // Modify this useEffect to reset and fetch when search parameters change
  useEffect(() => {
    resetSearch();
    fetchResources(1);
  }, [query, selectedCategory, selectedSubcategory, lat, lng, maxDistance, status]);

  // Remove the fetchResources call from this useEffect
  useEffect(() => {
    if (placeId !== lastPlaceId) {
      getLocation();
      resetSearch();
    }
  }, [placeId, lastPlaceId]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://${baseUrl}:3000/api/moderated-resources/${id}/approve`);
      // Remove the approved resource from the list
      setResources(prevResources => prevResources.filter(resource => resource.id !== id));
    } catch (error) {
      console.error('Error approving resource:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://${baseUrl}:3000/api/moderated-resources/${id}/reject`);
      // Remove the rejected resource from the list
      setResources(prevResources => prevResources.filter(resource => resource.id !== id));
    } catch (error) {
      console.error('Error rejecting resource:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://${baseUrl}:3000/api/resources/${id}`);
      // Remove the deleted resource from the list
      setResources(prevResources => prevResources.filter(resource => resource.id !== id));
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col">
      {/* Top Search Form (visible on large screens) */}
      <div className="hidden lg:block fixed top-16 left-0 right-0 bg-slate-200 shadow-lg z-10">
        <ModSearchForm 
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
          status={status}
          setStatus={setStatus}
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
            <div key={resource.id} className="relative">
              <EditResource id={resource.id} />
              <div className="absolute bottom-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleApprove(resource.id)}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                  title="Approve"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => handleReject(resource.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                  title="Reject"
                >
                  <FaTimes />
                </button>
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && <p className="text-center mb-4 text-gray-600">Loading more resources...</p>}
        
        {/* End of Resources Message */}
        {!loading && !hasMore && resources.length > 0 && (
          <p className="text-center mb-4 text-gray-600">No more resources to load.</p>
        )}

        {/* No Resources Message */}
        {!loading && !hasMore && resources.length === 0 && (
          <p className="text-center mb-4 text-gray-600">No resources found.</p>
        )}
      </div>

      {/* Bottom Search Form (visible on small screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-200 shadow-lg z-10">
        <ModSearchForm 
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
          status={status}
          setStatus={setStatus}
          maxDistance={maxDistance}
          setMaxDistance={setMaxDistance}
          categories={categories}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}

export default AdminModeration;
