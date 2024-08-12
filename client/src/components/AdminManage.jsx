import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminManage.css'; // Import the CSS file

const AdminManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parcel, setParcel] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchParcel = async () => {
      try {
        const response = await axios.get(`/parcels/${id}`); // Fetch parcel details
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
      await axios.patch(`/parcels/${id}`, { status: newStatus });

      // Send email notification
      await axios.post('/send-email', {
        to: [parcel.user.email, parcel.recipient.email],
        subject: 'Parcel Status Update',
        body: `Dear ${parcel.user.first_name} ${parcel.user.last_name}, the status of your parcel to ${parcel.recipient.first_name} ${parcel.recipient.last_name} is now ${newStatus}.`
      });

      alert('Status updated and email notifications sent!');
      navigate('/admin/view-orders');
    } catch (error) {
      console.error('Error updating parcel status or sending email:', error);
    }
  };

  if (!parcel) return <div>Loading...</div>;

  return (
    <div className="admin-manage">
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
          <select className="status-select" value={status} onChange={handleStatusChange}>
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
