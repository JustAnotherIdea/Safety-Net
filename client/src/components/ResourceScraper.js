import React, { useState, useEffect } from 'react';
import axios from 'axios';
import baseUrl from '../getBaseUrl';
import EditResource from './EditResource';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

function ResourceScraper() {
    const storedLocation = localStorage.getItem('scraper_location');
    const [location, setLocation] = useState(storedLocation || '');
    const [categories, setCategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [maxResults, setMaxResults] = useState(10);
    const [message, setMessage] = useState('');
    const [resources, setResources] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
        const response = await axios.get(`http://${baseUrl}:3000/api/categories`);
        setCategories(response.data);
        } catch (error) {
        console.error('Error fetching categories:', error);
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        localStorage.setItem('scraper_location', location);
        setResources([]);
        setMessage('Scraping resources...');
        try {
        const response = await axios.post(`http://${baseUrl}:3000/api/scrape-resources`, {
            location,
            category: selectedCategory,
            subcategory: selectedSubcategory,
            maxResults
        });
        setMessage('');
        fetchResources(response.data.resourceIds);
        } catch (error) {
        console.error('Error scraping resources:', error);
        setMessage('Error occurred while scraping resources');
        }
    };

    const fetchResources = async (ids) => {
        try {
        const resourcePromises = ids.map(id => 
            axios.get(`http://${baseUrl}:3000/api/resources/${id}`)
        );
        const resourceResponses = await Promise.all(resourcePromises);
        const fetchedResources = resourceResponses.map(response => response.data);
        setResources(fetchedResources);
        } catch (error) {
        console.error('Error fetching resources:', error);
        setMessage('Error occurred while fetching resources');
        }
    };

    const handleApprove = async (id) => {
        try {
        await axios.put(`http://${baseUrl}:3000/api/moderated-resources/${id}/approve`);
        setResources(prevResources => prevResources.filter(resource => resource.id !== id));
        } catch (error) {
        console.error('Error approving resource:', error);
        }
    };

    const handleReject = async (id) => {
        try {
        await axios.put(`http://${baseUrl}:3000/api/moderated-resources/${id}/reject`);
        setResources(prevResources => prevResources.filter(resource => resource.id !== id));
        } catch (error) {
        console.error('Error rejecting resource:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
        await axios.delete(`http://${baseUrl}:3000/api/resources/${id}`);
        setResources(prevResources => prevResources.filter(resource => resource.id !== id));
        } catch (error) {
        console.error('Error deleting resource:', error);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Resource Scraper</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full p-2 border rounded"
            required
            />
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
                {categories[selectedCategory].subcategories.map((subcategory) => (
                <option key={subcategory.name} value={subcategory.name}>
                    {subcategory.name}
                </option>
                ))}
            </select>
            </div>
        )}
            <input
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(e.target.value)}
            placeholder="Max Results"
            className="w-full p-2 border rounded"
            required
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Scrape Resources
            </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                <button
                    onClick={() => handleDelete(resource.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                    title="Delete"
                >
                    <FaTrash />
                </button>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}

export default ResourceScraper;