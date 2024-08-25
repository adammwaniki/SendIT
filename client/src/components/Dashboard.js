import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../css/Dashboard.css';
import {API_BASE_URL} from '../config';

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
    const fetchUserData = async (retryCount = 0) => {
      try {
        const sessionResponse = await fetch(`${API_BASE_URL}/check_session`, {
          method: 'GET',
          credentials: 'include'
        });
    
        if (sessionResponse.status === 204 && retryCount < 3) {
          setTimeout(() => fetchUserData(retryCount + 1), 1000);
          return;
        }
    
        if (!sessionResponse.ok) {
          const errorText = await sessionResponse.text();
          throw new Error(`Session check failed: ${errorText}`);
        }
        let sessionData = await sessionResponse.json();
    
        const userResponse = await fetch(`${API_BASE_URL}/users/${sessionData.id}`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          throw new Error(`Fetching user data failed: ${errorText}`);
        }
        let userData = await userResponse.json();
    
        setUser(userData);
        if (userData.roles.includes('admin')) {
          navigate('/admin/view-orders');
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

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setIsUserSignedIn(false);
        navigate('/');
      } else {
        throw new Error('Logout failed');
      }
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
