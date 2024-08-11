import React, { useState, useEffect } from 'react';
import '../css/CreateOrder.css';

function CreateOrder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [userAddress, setUserAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    latitude: '',
    longitude: ''
  });
  const [recipient, setRecipient] = useState({
    recipient_full_name: '',
    phone_number: ''
  });
  const [recipientId, setRecipientId] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    latitude: '',
    longitude: ''
  });
  const [parcel, setParcel] = useState({
    length: '',
    width: '',
    height: '',
    weight: '',
    cost: '',
    status: 'Pending'
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/check_session', {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUserId(userData.id);
        } else {
          console.error('User not logged in');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, []);

  const handleUserAddressSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      console.error('User ID is not available');
      return;
    }
    try {
      const response = await fetch('/user_addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userAddress,
          user_id: userId
        }),
        credentials: 'include'
      });
      if (response.ok) {
        setCurrentStep(2);
      } else {
        const errorData = await response.json();
        console.error('Failed to submit user address:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRecipientSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipient),
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRecipientId(data.id);
        setCurrentStep(3);
      } else {
        const errorData = await response.json();
        console.error('Failed to submit recipient:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRecipientAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/recipient_addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recipientAddress,
          recipient_id: recipientId
        }),
        credentials: 'include'
      });
      if (response.ok) {
        setCurrentStep(4);
      } else {
        const errorData = await response.json();
        console.error('Failed to submit recipient address:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          recipient_id: recipientId,
          length: parseFloat(parcel.length),
          width: parseFloat(parcel.width),
          height: parseFloat(parcel.height),
          weight: parseFloat(parcel.weight),
          cost: parseFloat(parcel.cost),
          status: parcel.status
        }),
        credentials: 'include'
      });
      if (response.ok) {
        console.log('Order created successfully');
        setCurrentStep(5);
      } else {
        const errorData = await response.json();
        console.error('Failed to create order:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="create-order">
      <h2>Create Order</h2>
      <div className="order-form">
        {/* User Address Form */}
        <form onSubmit={handleUserAddressSubmit} style={{display: currentStep === 1 ? 'block' : 'none'}}>
          <input
            type="text"
            value={userAddress.street}
            onChange={(e) => setUserAddress({...userAddress, street: e.target.value})}
            placeholder="Street"
            required
          />
          <input
            type="text"
            value={userAddress.city}
            onChange={(e) => setUserAddress({...userAddress, city: e.target.value})}
            placeholder="City"
            required
          />
          <input
            type="text"
            value={userAddress.state}
            onChange={(e) => setUserAddress({...userAddress, state: e.target.value})}
            placeholder="State"
          />
          <input
            type="text"
            value={userAddress.zip_code}
            onChange={(e) => setUserAddress({...userAddress, zip_code: e.target.value})}
            placeholder="ZIP Code"
          />
          <input
            type="text"
            value={userAddress.country}
            onChange={(e) => setUserAddress({...userAddress, country: e.target.value})}
            placeholder="Country"
            required
          />
          <input
            type="text"
            value={userAddress.latitude}
            onChange={(e) => setUserAddress({...userAddress, latitude: e.target.value})}
            placeholder="Latitude"
          />
          <input
            type="text"
            value={userAddress.longitude}
            onChange={(e) => setUserAddress({...userAddress, longitude: e.target.value})}
            placeholder="Longitude"
          />
          <button type="submit" disabled={currentStep !== 1 || !userId}>Submit Sender Address</button>
        </form>

        {/* Recipient Information Form */}
        <form onSubmit={handleRecipientSubmit} style={{display: currentStep === 2 ? 'block' : 'none'}}>
          <input
            type="text"
            value={recipient.recipient_full_name}
            onChange={(e) => setRecipient({...recipient, recipient_full_name: e.target.value})}
            placeholder="Full Name"
            required
          />
          <input
            type="tel"
            value={recipient.phone_number}
            onChange={(e) => setRecipient({...recipient, phone_number: e.target.value})}
            placeholder="Phone Number"
            required
          />
          <button type="submit" disabled={currentStep !== 2}>Submit Recipient Information</button>
        </form>

        {/* Recipient Address Form */}
        <form onSubmit={handleRecipientAddressSubmit} style={{display: currentStep === 3 ? 'block' : 'none'}}>
          <input
            type="text"
            value={recipientAddress.street}
            onChange={(e) => setRecipientAddress({...recipientAddress, street: e.target.value})}
            placeholder="Street"
            required
          />
          <input
            type="text"
            value={recipientAddress.city}
            onChange={(e) => setRecipientAddress({...recipientAddress, city: e.target.value})}
            placeholder="City"
            required
          />
          <input
            type="text"
            value={recipientAddress.state}
            onChange={(e) => setRecipientAddress({...recipientAddress, state: e.target.value})}
            placeholder="State"
          />
          <input
            type="text"
            value={recipientAddress.zip_code}
            onChange={(e) => setRecipientAddress({...recipientAddress, zip_code: e.target.value})}
            placeholder="ZIP Code"
          />
          <input
            type="text"
            value={recipientAddress.country}
            onChange={(e) => setRecipientAddress({...recipientAddress, country: e.target.value})}
            placeholder="Country"
            required
          />
          <input
            type="text"
            value={recipientAddress.latitude}
            onChange={(e) => setRecipientAddress({...recipientAddress, latitude: e.target.value})}
            placeholder="Latitude"
          />
          <input
            type="text"
            value={recipientAddress.longitude}
            onChange={(e) => setRecipientAddress({...recipientAddress, longitude: e.target.value})}
            placeholder="Longitude"
          />
          <button type="submit" disabled={currentStep !== 3}>Submit Recipient Address</button>
        </form>

        {/* Parcel Information Form */}
        <form onSubmit={handleCreateOrder} style={{display: currentStep === 4 ? 'block' : 'none'}}>
          <input
            type="number"
            value={parcel.length}
            onChange={(e) => setParcel({...parcel, length: e.target.value})}
            placeholder="Length"
            required
          />
          <input
            type="number"
            value={parcel.width}
            onChange={(e) => setParcel({...parcel, width: e.target.value})}
            placeholder="Width"
            required
          />
          <input
            type="number"
            value={parcel.height}
            onChange={(e) => setParcel({...parcel, height: e.target.value})}
            placeholder="Height"
            required
          />
          <input
            type="number"
            value={parcel.weight}
            onChange={(e) => setParcel({...parcel, weight: e.target.value})}
            placeholder="Weight"
            required
          />
          <input
            type="number"
            value={parcel.cost}
            onChange={(e) => setParcel({...parcel, cost: e.target.value})}
            placeholder="Cost"
          />
          <button type="submit" disabled={currentStep !== 4}>Create Order</button>
        </form>

        {currentStep === 5 && <p>Order created successfully!</p>}
      </div>
    </div>
  );
}

export default CreateOrder;