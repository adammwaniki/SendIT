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
        const sessionResponse = await axios.get(`${API_BASE_URL}/check_session`, {
          withCredentials: true
        });
    
        console.log('Session response:', sessionResponse.data);
    
        if (sessionResponse.data && sessionResponse.data.id) {
          const userData = await axios.get(`${API_BASE_URL}/users/${sessionResponse.data.id}`, {
            withCredentials: true
          });
          setUser(userData.data);
          if (!userData.data.roles.includes('user')) {
            navigate('/dashboard');
          }
        } else {
          throw new Error('Invalid session data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Session expired or invalid. Please log in again.');
        setIsUserSignedIn(false);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [setIsUserSignedIn, navigate]);

  const handleLogout = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/logout`, {
        withCredentials: true
      });
      setIsUserSignedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to <span className="highlight">SendIT</span></h1>
        <nav className="dashboard-nav">
          <button className={`nav-link ${activeLink === 'Get a Quote' ? 'active' : ''}`} onClick={() => setActiveLink('Get a Quote')}>Get a Quote</button>
          <button className={`nav-link ${activeLink === 'Create Order' ? 'active' : ''}`} onClick={() => setActiveLink('Create Order')}>Create Order</button>
          <button className={`nav-link ${activeLink === 'View Orders' ? 'active' : ''}`} onClick={() => setActiveLink('View Orders')}>View Orders</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </nav>
      </div>

      <div className="dashboard-content">
        <Suspense fallback={<div>Loading...</div>}>
          {activeLink === 'Get a Quote' && <GetQuote />}
          {activeLink === 'Create Order' && <CreateOrder />}
          {activeLink === 'View Orders' && <ViewOrders />}
        </Suspense>
        <Profile user={user} />
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  setIsUserSignedIn: PropTypes.func.isRequired,
};

export default Dashboard;
