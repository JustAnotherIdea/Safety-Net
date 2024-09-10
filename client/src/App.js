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
import AddResource from './components/AddResource'; // Import AddResource component

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/protected" element={<Protected />} />
          <Route path="/add-resource" element={<AddResource />} /> {/* Add Resource route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
