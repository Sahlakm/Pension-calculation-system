import React from "react";
import "./Navbar.css"; // Link to the CSS file
import logo from "./logo.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
	return (
		<nav className='navbar'>
			<div className='navbar-left' onClick={() => navigate("/")}>
				<img src={logo} alt='Logo' className='navbar-logo' />
				<div className='navbar-text'>
					<p className='navbar-title'>
						NATIONAL INSTITUTE OF TECHNOLOGY CALICUT
					</p>
					<p className='navbar-subtitle'>PENSION MANAGEMENT SYSTEM</p>
				</div>
			</div>

			<div className='navbar-right'>
				<button
					className='navbar-button home'
					onClick={() => navigate("/")}>
					Home
				</button>
				<button className='navbar-button logout'>Logout</button>
			</div>
		</nav>
	);
};

export default Navbar;
