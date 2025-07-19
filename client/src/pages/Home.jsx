import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container" style={{ padding: '40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#2C3E50' }}>Welcome to DeadlineDesk</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#34495E' }}>
        Manage your internships, track deadlines, and never miss a form submission again.
      </p>
      
      <div>
        <Link to="/login">
          <button style={buttonStyle}>Login</button>
        </Link>
        <Link to="/signup">
          <button style={{ ...buttonStyle, backgroundColor: '#2980B9' }}>Signup</button>
        </Link>
      </div>
    </div>
  );
};

const buttonStyle = {
  backgroundColor: '#2980B9',
  color: 'white',
  border: 'none',
  padding: '12px 25px',
  fontSize: '1rem',
  margin: '0 10px',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default Home;
