import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Search from './components/Search';
import Contribute from './components/Contribute';
import Donate from './components/Donate';
import Volunteer from './components/Volunteer';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Protected from './components/Protected';
import AddResource from './components/AddResource';
import MyResources from './components/MyResources';
import ResourceDetail from './components/ResourceDetail'; // Import ResourceDetail
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import styles for notifications

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <ToastContainer /> {/* Add ToastContainer here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-resources" element={<MyResources />} />
          <Route path="/add-resource" element={<AddResource />} />
          <Route path="/resource/:id" element={<ResourceDetail />} /> {/* Route for Resource Detail */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
