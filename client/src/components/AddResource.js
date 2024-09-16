import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddResource() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    url: '',
    image_url: '',
    location: '',
    description: '',
    phone_number: '',
    vacancies: 0,
    hours: '',
    rating: 0.0,
  });
  const [imageFile, setImageFile] = useState(null); // State for image file
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const MAX_SIZE = 5 * 1024 * 1024; // Limit to 5MB
    if (file.size > MAX_SIZE) {
      alert('File size exceeds 5MB. Please select a smaller file.');
      setImageFile(null);
      return; // Prevent further processing
    }
    setImageFile(file); // Set the image file state if it's valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    
    try {
      if (!imageFile) {
        return alert('Please select an image');
      }

      const fileName = `${Date.now()}_${imageFile.name}`;
      const fileType = imageFile.type;
      // Prepare the data with FormData
      const data = new FormData();
      data.append('file', imageFile);
      data.append('fileNameReq', fileName);
      data.append('fileTypeReq', fileType);
      const uploadURL = await axios.post('http://localhost:3000/api/upload', data, {
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

      formData.image_url = `https://safety-net-images.s3.amazonaws.com/${fileName}`
    

      const userId = JSON.parse(atob(token.split('.')[1])).id;
      await axios.post('http://localhost:3000/api/resources', {
        ...formData,
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
    <form onSubmit={handleSubmit}>
      <h2>Add Resource</h2>
      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Resource Name" required />
      <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" required />
      <input type="text" name="url" value={formData.url} onChange={handleChange} placeholder="Resource URL" />
      <input type="file" value={imageFile} onChange={handleImageChange} required /> {/* Input for image upload */}
      <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" required />
      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
      <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" />
      <input type="number" name="vacancies" value={formData.vacancies} onChange={handleChange} placeholder="Vacancies" />
      <input type="text" name="hours" value={formData.hours} onChange={handleChange} placeholder="Hours" />
      <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} placeholder="Rating" />
      <button type="submit">Add Resource</button>
    </form>
  );
}

export default AddResource;