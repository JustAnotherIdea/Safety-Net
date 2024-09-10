import React, { useState } from 'react';
import axios from 'axios';
import './Search.css'; // Import CSS for styling

function Search() {
  const [query, setQuery] = useState('');
  const [resources, setResources] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/resources`, {
        params: { query }
      });
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }

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
      <button className="search-button" onClick={handleSearch}>Search</button>
      <div className="results-container">
        {resources.map(resource => (
          <div key={resource.id} className="resource-card">
            <h2>{resource.name}</h2>
            <p>{resource.description}</p>
            <p>Location: {resource.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
