import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import OpeningHours from './OpeningHours';
import baseUrl from '../getBaseUrl';

function AddResource() {
  // const [formData, setFormData] = useState({
  //   category: '',
  //   url: '',
  //   image_url: '',
  //   location: '',
  //   description: '',
  //   phone_number: '',
  //   vacancies: 0,
  //   hours: '',
  // });
  const [imageFile, setImageFile] = useState(null); // State for image file
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [vacancies, setVacancies] = useState(0);
  const [hours, setHours] = useState([]);
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [places, setPlaces] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  let lastPlaceId = placeId;

  const navigate = useNavigate();

  // const handleHoursUpdate = (updatedHours) => {
  //   setHours(updatedHours); // Update opening hours state
  // };

  let typingTimer; // Declare a timer variable outside the function
  const typingDelay = 500; // Delay in milliseconds (adjust as needed)

  const handleLocationInputChange = async (e) => {
    const inputValue = e.target.value;
    setAddress(inputValue);
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

  const getLocation = async (placeId) => {
    if (placeId !== lastPlaceId) {
      const response = await axios.get(`http://${baseUrl}:3000/api/places/location`, {
        params: { place_id: placeId }
      });
      console.log(response);
      const details = {
        address: response.data.address,
        lat: response.data.lat,
        lng: response.data.lng,
        hours: response.data.opening_hours?.periods,
        url: response.data.website,
        phoneNumber: response.data.international_phone_number,
        name: response.data.name,
        imageUrl: response.data.image
      };
      setLat(details.lat);
      setLng(details.lng);
      setAddress(details.address);
      setHours(details.hours);
      setUrl(details.url);
      setPhoneNumber(details.phoneNumber);
      setName(details.name);
      setImageUrl(details.imageUrl);
      lastPlaceId = placeId;
      setImageFile(null);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const MAX_SIZE = 5 * 1024 * 1024; // Limit to 5MB
    if (file.size > MAX_SIZE) {
      alert('File size exceeds 5MB. Please select a smaller file.');
      setImageFile(null);
      return; // Prevent further processing
    }
    setImageFile(file); // Set the image file state if it's valid
    setImageUrl(URL.createObjectURL(file));
  };

  const handlePlaceClick = (place) => {
    setPlaceId(place.place_id);
    setAddress(place.description);
    setShowSuggestions(false); // Hide suggestions when user selects one
    getLocation(place.place_id); // Fetch place details
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    
    try {
      console.log(imageUrl);
      if (!imageFile && !imageUrl) {
        return alert('Please select an image');
      }

      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const fileType = imageFile.type;
        // Prepare the data with FormData
        const data = new FormData();
        data.append('file', imageFile);
        data.append('fileNameReq', fileName);
        data.append('fileTypeReq', fileType);
        const uploadURL = await axios.post(`http://${baseUrl}:3000/api/upload`, data, {
          headers: {
            'Authorization': token,
            'Content-Type': 'multipart/form-data' // Ensure correct content type
          }, fileName, fileType
        });
  
        // Upload the image to S3 using the signed URL
        await axios.put(uploadURL.data.url, imageFile, {
          headers: {
            'Content-Type': fileType,
          },
        });
  
        setImageUrl(`https://safety-net-images.s3.amazonaws.com/${fileName}`)
      }
    

      const userId = JSON.parse(atob(token.split('.')[1])).id;
      await axios.post(`http://${baseUrl}:3000/api/resources`, {
        location: address,
        name: name,
        url: url,
        image_url: imageUrl,
        description: description,
        phone_number: phoneNumber,
        category: category,
        vacancies: vacancies,
        hours: hours,
        lat: lat,
        lng: lng,
        place_id: placeId,
        user_id: userId, // Include user ID when submitting
      }, {
        headers: {
          'Authorization': token
        }
      });
      alert('Resource added successfully!');  // User feedback

      navigate('/my-resources'); // Redirect
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource, please try again.');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-md"
    >
      <h2 className="text-2xl font-bold mb-4">Add Resource</h2>

      {/* Image Preview */}
      {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover mb-4 rounded-md"/>}
      
      {/* Address Input */}
      <input
        type="text"
        className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-blue-500"
        value={address}
        onChange={handleLocationInputChange}
        placeholder="Enter address"
      />

      {/* Display autocomplete suggestions */}
      {showSuggestions && places.length > 0 && (
        <div className="mb-4">
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
      )}

      {/* Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" 
          name="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Resource Name"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-blue-500"
          required 
        />
        <input 
          type="text" 
          name="category" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          placeholder="Category"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-blue-500"
          required 
        />
        <input 
          type="text" 
          name="url" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="Resource URL"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-blue-500"
        />
        <input 
          type="file" 
          onChange={handleImageChange}
          className="w-full p-2 mb-4"
        />
        <input 
          type="text" 
          name="image_url" 
          value={imageUrl} 
          onChange={(e) => {
            setImageUrl(e.target.value);
            setImageFile(null);
          }} 
          placeholder="Image URL"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-blue-500"
        />
        <textarea 
          name="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Description"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-blue-500"
          required 
        />
        <input 
          type="text" 
          name="phone_number" 
          value={phoneNumber} 
          onChange={(e) => setPhoneNumber(e.target.value)} 
          placeholder="Phone Number"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-blue-500"
        />
        <input 
          type="number" 
          name="vacancies" 
          value={vacancies} 
          onChange={(e) => setVacancies(e.target.value)} 
          placeholder="Vacancies"
          className="w-full p-2 border rounded mb-4 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Opening Hours Component */}
      <div className="mb-4">
        <OpeningHours
          periods={hours}
          setPeriods={setHours}
        />
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full md:w-auto"
      >
        Add Resource
      </button>
    </form>
  );
}

export default AddResource;