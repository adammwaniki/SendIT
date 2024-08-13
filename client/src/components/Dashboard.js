import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import avatarImage from '../assets/images/avartar.avif';
import '../css/Dashboard.css';

const CreateOrder = lazy(() => import('./CreateOrder'));
const GetQuote = lazy(() => import('./GetQuote'));
const ViewOrders = lazy(() => import('./ViewOrders'));
const Profile = lazy(() => import('./Profile')); // New import

function Dashboard({ setIsUserSignedIn }) {
  const [activeLink, setActiveLink] = useState('Get a Quote');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/check_session', {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          checkUserProfile(userData);
        } else {
          throw new Error('Session check failed');
        }
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
    const hasIncompleteProfile = requiredFields.some(field => userData[field] === null);
    if (hasIncompleteProfile) {
      setActiveLink('Profile');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
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
        <div className="profile-view">
          <img src={user.profileImage || avatarImage} alt="Profile" className="profile-image" />
          <p className="profile-name">{`${user.first_name} ${user.last_name}`}</p>
        </div>
        <div className="main-view">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
}

Dashboard.propTypes = {
  setIsUserSignedIn: PropTypes.func.isRequired,
};

export default Dashboard;