import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Search.css';
import { Link } from 'react-router-dom';

function Search() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [resources, setResources] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); // For loading state
  const categories = ['Food', 'Housing', 'Health', 'Education'];

  const fetchResources = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/resources`, {
        params: { query, category: selectedCategory, page: currentPage, limit: 10 }
      });
      setResources(prevResources => [...prevResources, ...response.data]);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setResources([]); // Reset resources for new search
    fetchResources(); // Fetch resources with the current page
  };

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight &&
!loading) {
        setCurrentPage(prevPage => prevPage + 1); // Load next page
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Cleanup
  }, [loading]);

  useEffect(() => {
    fetchResources(); // Fetch resources when current page changes
  }, [currentPage, query, selectedCategory]);

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
      {loading && <p>Loading more resources...</p>} {/* Show loading text */}
    </div>
  );
}

export default Search;