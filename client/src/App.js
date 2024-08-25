import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import Homepage from './components/HomePage';
import Dashboard from './components/Dashboard';
import AdminView from './components/AdminView';
import AdminManage from './components/AdminManage';
import './App.css';
import {API_BASE_URL} from './config';


function App() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const MAPS_API_KEY = process.env.REACT_APP_MAPS_API_KEY;
  //const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/check_session`, {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          setIsUserSignedIn(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, []);

  return (
    <LoadScript
      googleMapsApiKey={`${MAPS_API_KEY}`}

      libraries={["geometry", "drawing", "places", "directions"]}
    >
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={<Homepage setIsUserSignedIn={setIsUserSignedIn} />}
          />
          <Route
            path="/login"
            element={<Homepage setIsUserSignedIn={setIsUserSignedIn} initialPage="login" />}
          />
          <Route
            path="/register"
            element={<Homepage setIsUserSignedIn={setIsUserSignedIn} initialPage="register" />}
          />
          <Route
            path="/dashboard"
            element={isUserSignedIn ? <Dashboard setIsUserSignedIn={setIsUserSignedIn} /> : <Navigate to="/login" />}
          />
          {/* New Admin Routes */}
          <Route 
            path={`/admin/view-orders`} 
            element={isUserSignedIn ? <AdminView /> : <Navigate to={`/login`} />} 
          />
          <Route 
            path={`/admin/manage-orders/:id`} 
            element={isUserSignedIn ? <AdminManage /> : <Navigate to={`/login`} />} 
          />
        </Routes>
      </div>
    </LoadScript>
  );
}

export default App;