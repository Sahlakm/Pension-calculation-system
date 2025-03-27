// src/components/LoginPage.js
import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';






const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate=useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    
    
try {
  const response = await axios.post('/user/signin', {
    
    email,
    password,
     
  });
  setMessage({ type: 'success', text: response.data.message });
    navigate('/');
    window.location.reload();

} catch (error) {
  setMessage({
    type: 'error',
    text: error.response?.data?.message || 'Invalid Credentials',
  });
}
   
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Welcome Back!</h2>
        {message && (
  <p className={message.type === 'error' ? 'error-message' : 'success-message'}>
    {message.text}
  </p>
)}
        <form onSubmit={handleLogin}>
      
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
          <div className="forgot-password">
          <small>  <a href="/forgot-password">Forgot Password?</a> </small>
            <br>
            </br>
         
          <div className="signup-link">
           <small> Don't have an account?</small> <a href="/signup">Signup</a>
          </div>
           
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
