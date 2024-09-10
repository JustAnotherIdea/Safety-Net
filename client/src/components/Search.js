import React, { useState } from 'react';
import axios from 'axios';

function Search() {
  const [query, setQuery] = useState('');
  const [resources, setResources] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/resources`, {
        params: { query }
      });
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }

  return (
    <div>
      <h1>Search</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search resources"
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        {resources.map(resource => (
          <div key={resource.id}>
            <h2>{resource.name}</h2>
            <p>{resource.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
