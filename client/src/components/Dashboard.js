import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../css/Dashboard.css';
import { API_BASE_URL } from '../config';

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
    const fetchUserData = async () => {
      try {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found');
        }
    
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
          withCredentials: true
        });
    
        setUser(response.data);
        checkUserProfile(response.data);
        
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
      await axios.delete(`${API_BASE_URL}/logout`, {
        withCredentials: true
      });
      sessionStorage.removeItem('userId');
      setIsUserSignedIn(false);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout. Please try again.');
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
