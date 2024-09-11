import React, { useState } from 'react';
import axios from 'axios';
import './Search.css';
import { Link } from 'react-router-dom'; // Import Link for navigation

function Search() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [resources, setResources] = useState([]);
  
  // Categories for filtering; this could also come from an API
  const categories = ['Food', 'Housing', 'Health', 'Education']; 

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/resources`, {
        params: { query, category: selectedCategory } // Include category in request
      });
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

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
      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
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
    </div>
  );
}

export default Search;
