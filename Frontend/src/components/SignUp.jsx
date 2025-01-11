import React, { useState } from 'react';
import { signin } from '../services/api';
import { signup } from '../services/api'; // Import the signup function from API services

function SignUp({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      const data = await signup(username, password); // Call the signup API
      setToken(data.token); // Set the token if signup is successful
      const response = await signin(username, password);
      setToken(response.token);
    } catch (error) {
      setErrorMessage(error.message || 'Error creating account.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={darkFormStyle}>
      <h2 style={{ textAlign: 'center', color: '#ffffff' }}>Sign Up</h2>
      {errorMessage && <p style={errorStyle}>{errorMessage}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={darkInputStyle}
        required
      />
      <input
        type="password"
        placeholder="Password (min. 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={darkInputStyle}
        required
      />
      <button type="submit" style={darkButtonStyle}>
        Sign Up
      </button>
    </form>
  );
}

// Styles
const darkFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const darkInputStyle = {
  padding: '10px',
  border: '1px solid #444',
  borderRadius: '5px',
  fontSize: '1em',
  backgroundColor: '#2c2c2c',
  color: '#fff',
};

const darkButtonStyle = {
  padding: '10px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1em',
  cursor: 'pointer',
};

const errorStyle = {
  color: 'red',
  fontSize: '0.9em',
  textAlign: 'center',
};

export default SignUp;
