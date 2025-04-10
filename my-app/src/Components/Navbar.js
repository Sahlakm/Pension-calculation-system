// import React from "react";
// import "./Navbar.css"; // Link to the CSS file
// import logo from "./logo.png";
// import { useNavigate } from "react-router-dom";

// const Navbar = () => {
//     const navigate = useNavigate();
// 	return (
// 		<nav className='navbar'>
// 			<div className='navbar-left' onClick={() => navigate("/")}>
// 				<img src={logo} alt='Logo' className='navbar-logo' />
// 				<div className='navbar-text'>
// 					<p className='navbar-title'>
// 						NATIONAL INSTITUTE OF TECHNOLOGY CALICUT
// 					</p>
// 					<p className='navbar-subtitle'>PENSION MANAGEMENT SYSTEM</p>
// 				</div>
// 			</div>

// 			<div className='navbar-right'>
// 				<button
// 					className='navbar-button home'
// 					onClick={() => navigate("/")}>
// 					Home
// 				</button>
// 				<button className='navbar-button logout'>Logout</button>
// 			</div>
// 		</nav>
// 	);
// };
// export default Navbar;


// Navbar.js
import { motion } from 'framer-motion';
import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
const handleLogout = async () => {
    try {
      await axios.get('/user/logout');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error.response?.data?.message || 'Error logging out');
    }
  };

const Navbar = ({ user }) => {
  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-logo">
        <Link to="/" className="logo-text">PMS</Link>
      </div>
      <ul className="navbar-links">
        
        
        {user ? (
          <>
            {/* <li><Link to="/profile">Profile</Link></li> */}
            <h1>Welcome, {user.username}</h1>
            <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </motion.nav>
  );
};

export default Navbar;
