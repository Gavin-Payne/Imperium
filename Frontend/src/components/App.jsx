import React, { useState } from 'react';
import SignUp from './SignUp';
import SignIn from './SignIn';

function App() {
  const [token, setToken] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const renderInterface = () => {
    const interfaces = [
      'Dashboard',
      'Trading Interface',
      'Active Auctions',
      'Profile',
      'Settings',
    ];
    return <div style={tabContentStyle}>{interfaces[currentTab]}</div>;
  };

  return (
    <div style={darkAppStyle}>
      <h1 style={darkHeaderStyle}>Imperium</h1>
      {!token ? (
        <div style={darkContainerStyle}>
          {isSignUp ? (
            <SignUp setToken={setToken} />
          ) : (
            <SignIn setToken={setToken} />
          )}
          <p style={{ textAlign: 'center', marginTop: '10px', color: '#ccc' }}>
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button onClick={() => setIsSignUp(false)} style={darkSubscriptButtonStyle}>
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button onClick={() => setIsSignUp(true)} style={darkSubscriptButtonStyle}>
                  Sign Up
                </button>
              </span>
            )}
          </p>
        </div>
      ) : (
        <>
          <div style={interfaceContainerStyle}>{renderInterface()}</div>
          <div style={navBarStyle}>
            {['Dashboard', 'Trading Interface', 'Active Auctions', 'Profile', 'Settings'].map(
              (label, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTab(index)}
                  style={{
                    ...navButtonStyle,
                    backgroundColor: currentTab === index ? '#4caf50' : '#2c2c2c',
                  }}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Styles
const darkAppStyle = {
  backgroundColor: '#121212',
  color: '#ffffff',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Arial, sans-serif',
};

const darkHeaderStyle = {
  textAlign: 'center',
  color: '#ffffff',
  margin: '20px 0',
};

const darkContainerStyle = {
  backgroundColor: '#1e1e1e',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
  maxWidth: '400px',
  margin: 'auto',
};

const darkSubscriptButtonStyle = {
  border: 'none',
  background: 'none',
  color: '#4caf50',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '0.9em',
};

const interfaceContainerStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
};

const tabContentStyle = {
  fontSize: '1.5em',
  color: '#ffffff',
};

const navBarStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  backgroundColor: '#1e1e1e',
  padding: '10px 0',
  borderTop: '1px solid #444',
};

const navButtonStyle = {
  padding: '10px',
  fontSize: '1em',
  color: '#ffffff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  flex: 1,
  margin: '0 5px',
};

export default App;