import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../getBaseUrl.js';

function ModeratorSearchForm({ 
  query, setQuery, 
  address, setAddress, 
  placeId, setPlaceId,
  selectedCategory, setSelectedCategory,
  selectedSubcategory, setSelectedSubcategory,
  maxDistance, setMaxDistance,
  categories,
  status, setStatus, // Add these new props
  onSearch
}) {
  const [places, setPlaces] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  let typingTimer;
  const typingDelay = 500;

  const handleLocationInputChange = async (e) => {
    const inputValue = e.target.value;
    setAddress(inputValue);
    if (!inputValue) {
      setShowSuggestions(false);
      return;
    }
    setShowSuggestions(true);

    clearTimeout(typingTimer);

    typingTimer = setTimeout(async () => {
      if (inputValue) {
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
    setShowSuggestions(false);
  };

  return (
    <div className="grid grid-cols-5 relative">
      <input
        type="text"
        className="p-2 border-t border-l border-slate-400 bg-slate-200 col-span-2 focus:outline-none focus:border-blue-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
      />
      <div className="col-span-2">
        <input
          type="text"
          className="p-2 border-t border-l border-slate-400 bg-slate-200 w-full focus:outline-none focus:border-blue-500"
          value={address}
          onChange={handleLocationInputChange}
          placeholder={address !== '' ? address : 'Enter address'}
        />
        
        {showSuggestions && (
          <div className="absolute left-0 w-full lg:top-full bottom-full lg:bottom-auto max-h-60 overflow-y-auto bg-white shadow-md z-20">
            <div className="lg:flex lg:flex-col flex flex-col-reverse">
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
          </div>
        )}
      </div>

      <div className="col-span-1">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border-t border-l border-slate-400 h-full w-full bg-slate-400 focus:outline-none focus:border-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className={`${selectedCategory !== '' ? "col-span-2" : "col-span-4"} w-full`}>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory('');
          }}
          className="p-2 border-t border-l border-slate-400 h-10 w-full bg-slate-400 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {Object.keys(categories).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="w-full col-span-2">
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="p-2 border-t border-l border-slate-400 h-10 w-full bg-slate-400 focus:outline-none focus:border-blue-500"
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

      <input
        type="number"
        className="p-2 border-t border-l border-slate-400 bg-slate-200 h-10 col-start-5 focus:outline-none focus:border-blue-500"
        value={maxDistance}
        onChange={(e) => setMaxDistance(e.target.value)}
        placeholder="Max Distance (miles)"
      />
    </div>
  );
}

export default ModeratorSearchForm;