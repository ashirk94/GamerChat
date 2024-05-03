import React, { useState } from 'react';
import '../css/Login.css'; // Import CSS styles for the login form

function Login() {
  // State variables to store username and password input values
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Event handler for updating the username state
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  // Event handler for updating the password state
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // Event handler for handling form submission
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    // Add logic here to handle form submission (e.g., sending login credentials to server)
    console.log('Submitting login credentials...');
  };

  return (
    <div>
      <div className="login-container">
      <img src="/src/images/gamerchat-logo.png" alt="Image" className="logo" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className ="username-input" >Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className ="username-input">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;