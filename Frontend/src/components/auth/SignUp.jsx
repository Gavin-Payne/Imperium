import React, { useState } from 'react';
import { authService } from '../../services/authService'; // Update this import
import { modernFormStyle, modernInputStyle, modernButtonStyle } from '../../styles/components/forms.styles';

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
      const data = await authService.signup(username, password);
      setToken(data.token);
      const response = await authService.signin(username, password);
      setToken(response.token);
    } catch (error) {
      setErrorMessage(error.message || 'Error creating account.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={modernFormStyle}>
      <h2 style={{ textAlign: 'center', color: '#ffffff' }}>Sign Up</h2>
      {errorMessage && <p style={errorStyle}>{errorMessage}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={modernInputStyle}
        required
      />
      <input
        type="password"
        placeholder="Password (min. 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={modernInputStyle}
        required
      />
      <button type="submit" style={modernButtonStyle}>
        Sign Up
      </button>
    </form>
  );
}

const errorStyle = {
  color: 'red',
  fontSize: '0.9em',
  textAlign: 'center',
};

export default SignUp;