import React, { useState } from 'react';
import '../css/Login.css';

function Login({ setActivePage, onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
    } else if (password.length < 6) {
      setError('Password must be at least 6 characters long');
    } else {
      setError('');
      // Proceed with login logic here
      console.log('Login attempt with:', email, password);
      onSignIn();
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        <form className="login-form" onSubmit={handleLogin}>
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
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Login</button>
          <a href="#" className="forgot-password">Forgot Password?</a>
          <p className="register-link">
            Don't have an account? <a href="#" onClick={() => setActivePage('register')}>Register</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;