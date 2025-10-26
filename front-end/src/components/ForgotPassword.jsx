import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Alert, Button, Spinner } from 'react-bootstrap';
import { useUserAuth } from "../context/UserAuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { resetPassword } = useUserAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage("Password reset email sent! Please check your inbox and spam folder.");
      setEmail(""); // Clear the email field
    } catch (err) {
      console.error("Password reset error:", err);
      
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many requests. Please try again later.");
          break;
        default:
          setError("Failed to send password reset email. Please try again.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded bg-white shadow-sm" style={{ width: '350px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-key" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
        </div>
        
        <h2 className="mb-3 text-center">Reset Password</h2>
        
        <p className="text-muted text-center mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {error && <Alert variant='danger'>{error}</Alert>}
        {message && <Alert variant='success'>{message}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Sending...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
        </Form>
        
        <div className="mt-4 text-center">
          <Link to="/login" className="text-decoration-none">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Login
          </Link>
        </div>
        
        <div className="mt-2 text-center">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}