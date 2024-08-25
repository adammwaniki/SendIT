import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../css/Dashboard.css';
import {API_BASE_URL} from '../config';

//const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const Profile = lazy(() => import('./Profile'));
const CreateOrder = lazy(() => import('./CreateOrder'));
const GetQuote = lazy(() => import('./GetQuote'));
const ViewOrders = lazy(() => import('./ViewOrders'));

function Dashboard({ setIsUserSignedIn }) {
  const [activeLink, setActiveLink] = useState('Get a Quote');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Implementing a retry mechanism with a delay to allow a session to be properly established
    const fetchUserData = async (retryCount = 0) => {
      try {
        const sessionResponse = await fetch(`${API_BASE_URL}/check_session`, {
          method: 'GET',
          credentials: 'include'
        });
    
        if (sessionResponse.status === 204 && retryCount < 3) {
          // If no content and we haven't reached max retries, wait and try again
          setTimeout(() => fetchUserData(retryCount + 1), 1000);
          return;
        }
    
        if (!sessionResponse.ok) {
          const errorText = await sessionResponse.text();
          throw new Error(`Session check failed: ${errorText}`);
        }
        let sessionData;
        try {
          sessionData = await sessionResponse.json();
        } catch (jsonError) {
          console.error('Error parsing session JSON:', jsonError);
          throw new Error('Failed to parse session data');
        }
    
        // Step 2: Fetch full user data
        const userResponse = await fetch(`${API_BASE_URL}/users/${sessionData.id}`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          throw new Error(`Fetching user data failed: ${errorText}`);
        }
        let userData;
        try {
          userData = await userResponse.json();
        } catch (jsonError) {
          console.error('Error parsing user JSON:', jsonError);
          throw new Error('Failed to parse user data');
        }
    
        setUser(userData);
        checkUserProfile(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
        setIsUserSignedIn(false);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [setIsUserSignedIn, navigate]);

  const checkUserProfile = (userData) => {
    const requiredFields = ['phone_number', 'city', 'street', 'country', 'state', 'zip_code'];
    const hasIncompleteProfile = requiredFields.some(field => !userData[field]);
    if (hasIncompleteProfile) {
      setActiveLink('Profile');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setIsUserSignedIn(false);
        navigate('/login');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Logout failed. Please try again.');
    }
  };

  const renderActiveComponent = () => {
    const components = {
      'Get a Quote': GetQuote,
      'Create Order': CreateOrder,
      'View Orders': ViewOrders,
      'Profile': Profile
    };
    const Component = components[activeLink];
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Component user={user} setUser={setUser} />
      </Suspense>
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error}</div>;
  if (!user) return <div>No user data available</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          <span className="highlight">SendIT</span> Dashboard
        </h1>
        <nav className="dashboard-nav">
          {['Get a Quote', 'Create Order', 'View Orders', 'Profile'].map((link) => (
            <button
              key={link}
              className={`nav-link ${activeLink === link ? 'active' : ''}`}
              onClick={() => setActiveLink(link)}
            >
              {link}
            </button>
          ))}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>
      <main className="dashboard-content">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

Dashboard.propTypes = {
  setIsUserSignedIn: PropTypes.func.isRequired,
};

export default Dashboard;