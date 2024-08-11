import React, { useState } from 'react';
import '../css/Register.css';

function Register({ setActivePage, onRegisterSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      setError('Please enter your first and last name');
    } else if (!validateEmail(email)) {
      setError('Please enter a valid email address');
    } else if (password.length < 6) {
      setError('Password must be at least 6 characters long');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      setError('');
      setIsLoading(true);
      try {
        const response = await fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Sign up successful:', data);
          onRegisterSuccess(); // Call the onRegisterSuccess callback
        } else {
          setError(data.message || 'An error occurred during signup');
        }
      } catch (error) {
        console.error('Error during signup:', error);
        setError('An error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">SIGN UP</h2>
        <form className="register-form" onSubmit={handleSignUp}>
          <div className="input-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="signup-button" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
          <p className="login-link">
            Already have an account? <a href="#" onClick={() => setActivePage('login')}>Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;