import React from 'react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Registration</h1>
      <p>Registration page will be implemented here.</p>
      <Link to="/login">Back to Login</Link>
    </div>
  );
};

export default Register;
