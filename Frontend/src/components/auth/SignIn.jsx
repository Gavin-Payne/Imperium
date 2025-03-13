import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const SignIn = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [newUsername, setNewUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Both username and password are required!');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authService.signin(username, password);
      setToken(response.token);
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Google Sign In success', decoded);
      
      // First, check if this Google account already exists
      const checkRes = await fetch('http://localhost:5000/api/google-signin/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: decoded.email
        })
      });
      
      const checkData = await checkRes.json();
      
      if (checkData.exists) {
        // User exists, proceed with normal sign in
        const res = await fetch('http://localhost:5000/api/google-signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            credential: credentialResponse.credential,
          })
        });
        
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
        } else {
          throw new Error('No token received');
        }
      } else {
        // New user, show username input
        setGoogleCredential(credentialResponse.credential);
        setShowUsernameInput(true);
      }
    } catch (err) {
      console.error('Google Sign In error:', err);
      setError('Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setError('Username is required');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          credential: googleCredential,
          username: newUsername
        })
      });
      
      const data = await res.json();
      if (data.error === 'username_taken') {
        setError('Username is already taken');
        return;
      }
      
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      console.error('Username submission error:', err);
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (showUsernameInput) {
    return (
      <div style={containerStyle}>
        <form onSubmit={handleUsernameSubmit} style={formStyle}>
          <h2 style={headerStyle}>Choose Your Username</h2>
          {error && <p style={errorStyle}>{error}</p>}
          <input
            type="text"
            placeholder="Enter username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    );
  }

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
        
        {/* New Google Sign-In Button */}
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.error('Login Failed');
              setError('Google Sign In failed. Please try again.');
            }}
            useOneTap
          />
        </div>
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
  height: '50vh'
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
