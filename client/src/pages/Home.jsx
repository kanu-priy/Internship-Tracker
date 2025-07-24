// import React from 'react';
// import { Link } from 'react-router-dom';

// const Home = () => {
//   return (
//     <div className="home-container" style={{ padding: '40px', textAlign: 'center' }}>
//       <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#2C3E50' }}>Welcome to DeadlineDesk</h1>
//       <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#34495E' }}>
//         Manage your internships, track deadlines, and never miss a form submission again.
//       </p>
      
//       <div>
//         <Link to="/login">
//           <button style={buttonStyle}>Login</button>
//         </Link>
//         <Link to="/signup">
//           <button style={{ ...buttonStyle, backgroundColor: '#2980B9' }}>Signup</button>
//         </Link>
//       </div>
//     </div>
//   );
// };

// const buttonStyle = {
//   backgroundColor: '#2980B9',
//   color: 'white',
//   border: 'none',
//   padding: '12px 25px',
//   fontSize: '1rem',
//   margin: '0 10px',
//   borderRadius: '5px',
//   cursor: 'pointer'
// };

// export default Home;

import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#f0f9ff] flex flex-col items-center justify-center text-center px-6 py-10">
      {/* Heading */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 leading-tight mb-4 drop-shadow-sm">
        Welcome to <span className="text-blue-600">DeadlineDesk</span>
      </h1>

      {/* Tagline */}
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8 font-medium">
        Your smart companion to track internship tasks, daily logs, and important form deadlines — all in one place.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link to="/login">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-3 rounded-full transition shadow-lg">
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-white hover:bg-blue-50 border border-blue-600 text-blue-600 text-lg px-6 py-3 rounded-full transition shadow-lg">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Image */}
      <img
        src="https://cdn.dribbble.com/users/25514/screenshots/14317214/media/fd5310ddf2b1ea0c78844c3fa894cfe2.png"
        alt="Internship Tracking Illustration"
        className="w-full max-w-3xl rounded-2xl shadow-xl"
      />

      {/* Footer Note (Optional) */}
      <p className="mt-10 text-sm text-gray-500">Made with 💙 for students who hustle.</p>
    </div>
  );
};

export default Home;
