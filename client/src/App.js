import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Home from './components/Home';
import Search from './components/Search';
import Contribute from './components/Contribute';
import Donate from './components/Donate';
import Volunteer from './components/Volunteer';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import Navbar from './components/Navbar';
import Protected from './components/Protected';
import AddResource from './components/AddResource';
import MyResources from './components/MyResources';
import ResourceDetail from './components/ResourceDetail'; // Import ResourceDetail
import AdminUsers from './components/AdminUsers';
import AdminModeration from './components/AdminModeration';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import styles for notifications

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <ToastContainer /> {/* Add ToastContainer here */}
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/my-resources" element={<MyResources />} />
          <Route path="/add-resource" element={<AddResource />} />
          <Route path="/resource/:id" element={<ResourceDetail />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-moderation" element={<AdminModeration />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
