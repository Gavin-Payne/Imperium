import React, { useState } from 'react';
import { signin } from '../services/api';

const SignIn = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Both username and password are required!');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await signin(username, password);
      setToken(response.token);
      localStorage.setItem('token', response.token);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Incorrect Username or Password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={headerStyle}>Sign In</h2>
        {error && <p style={errorStyle}>{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

// Styles
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#1a1a1a',
};

const formStyle = {
  backgroundColor: '#2c2c2c',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const headerStyle = {
  textAlign: 'center',
  color: '#ffffff',
  marginBottom: '10px',
};

const inputStyle = {
  padding: '10px',
  border: '1px solid #444',
  borderRadius: '5px',
  fontSize: '1em',
  backgroundColor: '#1a1a1a',
  color: '#fff',
};

const buttonStyle = {
  padding: '10px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  fontSize: '1em',
  cursor: 'pointer',
};

const errorStyle = {
  color: '#ff4d4d',
  textAlign: 'center',
  marginBottom: '10px',
  fontSize: '0.9em',
};

export default SignIn;
