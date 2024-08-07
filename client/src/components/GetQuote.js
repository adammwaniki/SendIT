import React, { useState } from 'react';
import '../css/GetQuote.css';

function GetQuote() {
  const [quoteData, setQuoteData] = useState({
    senderAddress: '',
    deliveryAddress: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    numberOfParcels: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuoteData(prevData => ({
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
    Object.keys(quoteData).forEach(key => {
      if (!quoteData[key].trim()) {
        tempErrors[key] = 'This field is required';
        isValid = false;
      }
    });

    // Check numeric fields
    ['weight', 'length', 'width', 'height', 'numberOfParcels'].forEach(key => {
      if (quoteData[key] && !/^\d+$/.test(quoteData[key])) {
        tempErrors[key] = 'This field must contain only digits';
        isValid = false;
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  const handleGenerateQuote = () => {
    if (validateInputs()) {
      // Here you would typically call an API to generate the quote
      console.log('Generating quote with data:', quoteData);
    } else {
      console.log('Validation failed');
    }
  };

  return (
    <div className="get-quote">
      <h2>Get a Quote</h2>
      <div className="quote-form">
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="senderAddress">Sender Address</label>
            <input
              type="text"
              id="senderAddress"
              name="senderAddress"
              value={quoteData.senderAddress}
              onChange={handleInputChange}
            />
            {errors.senderAddress && <span className="error">{errors.senderAddress}</span>}
          </div>
          <div className="input-group">
            <label htmlFor="deliveryAddress">Delivery Address</label>
            <input
              type="text"
              id="deliveryAddress"
              name="deliveryAddress"
              value={quoteData.deliveryAddress}
              onChange={handleInputChange}
            />
            {errors.deliveryAddress && <span className="error">{errors.deliveryAddress}</span>}
          </div>
          <div className="input-group">
            <label htmlFor="weight">Parcel Weight (kg)</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={quoteData.weight}
              onChange={handleInputChange}
            />
            {errors.weight && <span className="error">{errors.weight}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="length">Parcel Length (cm)</label>
            <input
              type="text"
              id="length"
              name="length"
              value={quoteData.length}
              onChange={handleInputChange}
            />
            {errors.length && <span className="error">{errors.length}</span>}
          </div>
          <div className="input-group">
            <label htmlFor="width">Parcel Width (cm)</label>
            <input
              type="text"
              id="width"
              name="width"
              value={quoteData.width}
              onChange={handleInputChange}
            />
            {errors.width && <span className="error">{errors.width}</span>}
          </div>
          <div className="input-group">
            <label htmlFor="height">Parcel Height (cm)</label>
            <input
              type="text"
              id="height"
              name="height"
              value={quoteData.height}
              onChange={handleInputChange}
            />
            {errors.height && <span className="error">{errors.height}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="numberOfParcels">Number of Parcels</label>
            <input
              type="text"
              id="numberOfParcels"
              name="numberOfParcels"
              value={quoteData.numberOfParcels}
              onChange={handleInputChange}
            />
            {errors.numberOfParcels && <span className="error">{errors.numberOfParcels}</span>}
          </div>
          <div className="amount">
            Amount (Ksh): <span className="amount-value">xx,xxx,000</span>
          </div>
          <button className="generate-quote" onClick={handleGenerateQuote}>Generate Quotation</button>
        </div>
      </div>
    </div>
  );
}

export default GetQuote;