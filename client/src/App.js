import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import Homepage from './components/HomePage';
import Dashboard from './components/Dashboard';
import AdminView from './components/AdminView';
import AdminManage from './components/AdminManage';
import './App.css';

function App() {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/check_session', {
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
      googleMapsApiKey="GOOGLE MAPS API KEY HERE"

      libraries={["geometry", "drawing", "places", "directions"]}
    >
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={isUserSignedIn ? <Navigate to="/dashboard" /> : <Homepage setIsUserSignedIn={setIsUserSignedIn} />}
          >
            <Route path="login" element={<Homepage setIsUserSignedIn={setIsUserSignedIn} initialPage="login" />} />
            <Route path="register" element={<Homepage setIsUserSignedIn={setIsUserSignedIn} initialPage="register" />} />
          </Route>
          <Route 
            path="/dashboard" 
            element={isUserSignedIn ? <Dashboard setIsUserSignedIn={setIsUserSignedIn} /> : <Navigate to="/login" />} 
          />
          {/* New Admin Routes */}
          <Route 
            path="/admin/view-orders" 
            element={isUserSignedIn ? <AdminView /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/manage-orders/:id" 
            element={isUserSignedIn ? <AdminManage /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </LoadScript>
  );
}

export default App;