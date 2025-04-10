import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';

import LoginPage from './Components/Login';
import SignupPage from './Components/Signup';
import HomePage from './Components/Home';
import PensionerForm from './Components/Pensionerform';
import Rules from './Components/RuleManagement';
import Navbar from './Components/Navbar';
function App() {
 
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("useEffect is running...");
    const checkUser = async () => {
      try {
        console.log("Fetching user authentication status...");
        
        const response = await axios.get('/auth/user', { withCredentials: true });
        setUser(response.data.user); // Assuming the API returns { user: { username, email, ... } }
        console.log("Hi response",response.data.user);
       
      } catch (error) {
        console.log("User not authenticated", error);
        setUser(null);
      }
    };

    checkUser();
  }, []);


  return (
    <Router>
      {/* <Navbar user={user}/> */}
      <div className="App">
        <Routes>
          <Route path="/login" element={<><LoginPage /></>} />
          <Route path="/signup" element={<><SignupPage /></>} />
          <Route path="/" element={<><Navbar user={user} /><HomePage user={user}/></>} />
          <Route path="/add-employee" element={<><Navbar user={user} /><PensionerForm user={user}/></>} /> {/* Pass user as prop */}
          <Route path="/rules" element={<><Navbar user={user} /><Rules user={user}/></>} /> {/* Pass user as prop */}
       
        </Routes>
      </div>
    </Router>
  );

}
export default App;