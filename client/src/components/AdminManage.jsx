import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/AdminManage.css'; // Import the CSS file
import {API_BASE_URL} from '../config';



const AdminManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parcel, setParcel] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/parcels/${id}`); // Fetch parcel details
        setParcel(response.data);
        setStatus(response.data.status);
      } catch (error) {
        console.error('Error fetching parcel:', error);
      }
    };

    fetchParcel();
  }, [id]);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);

    try {
      // Update parcel status
      await axios.patch(`${API_BASE_URL}/parcels/${id}`, { status: newStatus });

      // Send email notification to the user
      await axios.post(`${API_BASE_URL}/send-email`, {
        to: [parcel.user.email],
        subject: 'Parcel Status Update',
        body: `Dear ${parcel.user.first_name} ${parcel.user.last_name}, 
        the status of your parcel to ${parcel.recipient.first_name} ${parcel.recipient.last_name} is now ${newStatus}. 
        Tracking Number: ${parcel.tracking_number} 
        Got a Package? Let's SendIT! `,
      });

      // Send email notification to the recipient
      await axios.post(`${API_BASE_URL}/send-email`, {
        to: [parcel.recipient.email],
        subject: 'Parcel Status Update',
        body: `Dear ${parcel.recipient.first_name} ${parcel.recipient.last_name}, 
        the status of your parcel from ${parcel.user.first_name} ${parcel.user.last_name} is now ${newStatus}. 
        Tracking Number: ${parcel.tracking_number} 
        Got a Package? Let's SendIT! `,
      });

      alert('Status updated and email notifications sent!');
      navigate(`/admin/view-orders`);
    } catch (error) {
      console.error('Error updating parcel status or sending email:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'DELETE',
        credentials: 'include' // Include credentials (cookies) with the request
      });
      if (response.ok) {
        navigate(`${API_BASE_URL}/login`); // Redirect to login page after successful logout
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!parcel) return <div>Loading...</div>;

  // Determine the status class for background color
  const getStatusClass = (status) => {
    switch (status) {
      case 'Accepted':
        return 'status-accepted';
      case 'Out For Delivery':
        return 'status-out-for-delivery';
      case 'Delivered':
        return 'status-delivered';
      default:
        return '';
    }
  };

  return (
    <div className="admin-manage">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-title">Admin Dashboard</div>
          <div className="navbar-nav">
            <button className="nav-link" onClick={() => navigate(`/admin/view-orders`)}>View Orders</button>
            <button className="nav-link active" onClick={() => navigate(`/admin/manage-orders/${id}`)}>Manage Order</button>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="card-container">
        <div className="card">
          <h2>Sender Details</h2>
          <p>Name: {`${parcel.user.first_name} ${parcel.user.last_name}`}</p>
          <p>Email: {parcel.user.email}</p>
          <p>Phone: {parcel.user.phone}</p>
          <p>Address: {parcel.user.street}, {parcel.user.city}, {parcel.user.state}, {parcel.user.zip_code}, {parcel.user.country}</p>
        </div>
        <div className="card">
          <h2>Parcel Details</h2>
          <p>Tracking Number: {parcel.tracking_number}</p>
          <p>Dimensions: {parcel.length} x {parcel.width} x {parcel.height}</p>
          <p>Weight: {parcel.weight}</p>
          <p>Cost: ${parcel.cost}</p>
          <p>Status: {parcel.status}</p>
          <select className={`status-select ${getStatusClass(status)}`} value={status} onChange={handleStatusChange}>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Out For Delivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
        <div className="card">
          <h2>Recipient Details</h2>
          <p>Name: {`${parcel.recipient.first_name} ${parcel.recipient.last_name}`}</p>
          <p>Email: {parcel.recipient.email}</p>
          <p>Phone: {parcel.recipient.phone}</p>
          <p>Address: {parcel.recipient.street}, {parcel.recipient.city}, {parcel.recipient.state}, {parcel.recipient.zip_code}, {parcel.recipient.country}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminManage;
