import React, { useState } from 'react';
import '../css/CreateOrder.css';

function CreateOrder() {
  const [orderData, setOrderData] = useState({
    // Sender Information
    senderName: '',
    senderTelephone: '',
    billingAddress: '',
    senderAddress: '',
    // Recipient Information
    recipientName: '',
    recipientTelephone: '',
    deliveryAddress: '',
    // Parcel Details
    length: '',
    width: '',
    height: '',
    actualWeight: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prevData => ({
      ...prevData,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  const validateInputs = () => {
    let tempErrors = {};
    let isValid = true;

    // Check for empty fields
    Object.keys(orderData).forEach(key => {
      if (!orderData[key].trim()) {
        tempErrors[key] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  const handleCreateOrder = () => {
    if (validateInputs()) {
      // Here you would typically call an API to create the order
      console.log('Creating order with data:', orderData);
    } else {
      console.log('Validation failed');
    }
  };

  return (
    <div className="create-order">
      <h2>Create Order</h2>
      <div className="order-form">
        <div className="form-row">
          <div className="form-column">
            <h3>Sender Information</h3>
            <div className="input-group">
              <label htmlFor="senderName">Name</label>
              <input
                type="text"
                id="senderName"
                name="senderName"
                value={orderData.senderName}
                onChange={handleInputChange}
              />
              {errors.senderName && <span className="error">{errors.senderName}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="senderTelephone">Telephone</label>
              <input
                type="tel"
                id="senderTelephone"
                name="senderTelephone"
                value={orderData.senderTelephone}
                onChange={handleInputChange}
              />
              {errors.senderTelephone && <span className="error">{errors.senderTelephone}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="billingAddress">Billing Address</label>
              <input
                type="text"
                id="billingAddress"
                name="billingAddress"
                value={orderData.billingAddress}
                onChange={handleInputChange}
              />
              {errors.billingAddress && <span className="error">{errors.billingAddress}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="senderAddress">Sender Address</label>
              <input
                type="text"
                id="senderAddress"
                name="senderAddress"
                value={orderData.senderAddress}
                onChange={handleInputChange}
              />
              {errors.senderAddress && <span className="error">{errors.senderAddress}</span>}
            </div>
          </div>
          <div className="form-column">
            <h3>Recipient Information</h3>
            <div className="input-group">
              <label htmlFor="recipientName">Name</label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={orderData.recipientName}
                onChange={handleInputChange}
              />
              {errors.recipientName && <span className="error">{errors.recipientName}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="recipientTelephone">Telephone</label>
              <input
                type="tel"
                id="recipientTelephone"
                name="recipientTelephone"
                value={orderData.recipientTelephone}
                onChange={handleInputChange}
              />
              {errors.recipientTelephone && <span className="error">{errors.recipientTelephone}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="deliveryAddress">Delivery Address</label>
              <input
                type="text"
                id="deliveryAddress"
                name="deliveryAddress"
                value={orderData.deliveryAddress}
                onChange={handleInputChange}
              />
              {errors.deliveryAddress && <span className="error">{errors.deliveryAddress}</span>}
            </div>
          </div>
        </div>
        <div className="parcel-details">
          <h3>Parcel Details</h3>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="length">Length (cm)</label>
              <input
                type="text"
                id="length"
                name="length"
                value={orderData.length}
                onChange={handleInputChange}
              />
              {errors.length && <span className="error">{errors.length}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="width">Width (cm)</label>
              <input
                type="text"
                id="width"
                name="width"
                value={orderData.width}
                onChange={handleInputChange}
              />
              {errors.width && <span className="error">{errors.width}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="text"
                id="height"
                name="height"
                value={orderData.height}
                onChange={handleInputChange}
              />
              {errors.height && <span className="error">{errors.height}</span>}
            </div>
            <div className="input-group">
              <label htmlFor="actualWeight">Actual Weight (kg)</label>
              <input
                type="text"
                id="actualWeight"
                name="actualWeight"
                value={orderData.actualWeight}
                onChange={handleInputChange}
              />
              {errors.actualWeight && <span className="error">{errors.actualWeight}</span>}
            </div>
          </div>
        </div>
        <button className="create-order-btn" onClick={handleCreateOrder}>Create Order</button>
      </div>
    </div>
  );
}

export default CreateOrder;