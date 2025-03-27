import React, { useState } from 'react';
import './Signup.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state
  const navigate = useNavigate();

 

  const handleSignup = async (e) => {
    e.preventDefault();
    // Validate email structure
    const studentRegex = /^[a-zA-Z0-9._%+-]+_[mbp]\d{6}cs@nitc\.ac\.in$/;
    const staffRegex = /^[a-zA-Z0-9._%+-]+@nitc\.ac\.in$/;
    //  setUserType('Employee');
    if(email=="admin_PMS@nitc.ac.in"){
      setUserType('Admin');
    }
    else if (studentRegex.test(email)) {
      setUserType('Employee');
    } 
    else {
      setMessage({
        type: 'error',
        text: 'Login with institute email.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true); // Start loading

    try {
      // const formData = new FormData();
      // formData.append('username', username);
      // formData.append('email', email);
      // formData.append('password', password);
      // formData.append('confirmPassword', confirmPassword);
      // formData.append('userType', userType);
      // for (let pair of formData.entries()) {
      //   console.log(pair[0] + ": " + pair[1]);
      // }
      console.log(userType);
      const response = await axios.post('/user/signup',  {
        username,
        email,
        password,
        confirmPassword,
        userType,
      });

      setMessage({ type: 'success', text: response.data.message });

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'An error occurred during signup.',
      });
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Create an Account</h2>
        {message && (
          <p className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.text}
          </p>
        )}
       <form onSubmit={(e) => { handleSignup(e); }} encType="multipart/form-data">

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="signup-button"
            disabled={isSubmitting} // Disable button during submission
          >
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
          <div className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
