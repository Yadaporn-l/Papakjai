import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Alert, Button, Spinner, Modal } from 'react-bootstrap';
import { useUserAuth } from "../context/UserAuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const { signUp, sendVerificationEmail, user } = useUserAuth();
  const navigate = useNavigate();

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/login");
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 6) {
      errors.push("at least 6 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("one uppercase letter (A-Z)");
    }
    if (!/\d/.test(password)) {
      errors.push("one number (0-9)");
    }
    if (!/[!@#_%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("one special character (!@#_%...)");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError("Password must contain: " + passwordErrors.join(", ") + ".");
      return;
    }

    setLoading(true);

    try {
      console.log("Starting registration process...");

      const userCredential = await signUp(email, password, name);
      console.log("User registration successful:", userCredential.user);

      if (userCredential.user) {
        try {
          console.log("Attempting to send verification email to:", userCredential.user.email);
          await sendVerificationEmail(userCredential.user);
          console.log("Verification email sent successfully");

          setPendingUser(userCredential.user);
          setUserEmail(userCredential.user.email);
          setShowModal(true);

          // Auto-delete after 30 minutes
          setTimeout(async () => {
            try {
              await pendingUser.reload();
              if (!pendingUser.emailVerified) {
                await pendingUser.delete();
                console.log("Unverified user account deleted");
              }
            } catch (error) {
              console.error("Error in cleanup process:", error);
            }
          }, 30 * 60 * 1000);

        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
          setError("Registration successful! However, we couldn't send the verification email. You can request a new one after signing in.");

          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      }

    } catch (err) {
      console.error("Sign up error:", err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please sign in or use a different email.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please use a stronger password.");
          break;
        case "permission-denied":
          setError("Registration failed due to permissions. Please contact support.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection and try again.");
          break;
        default:
          setError(`Registration failed: ${err.message}`);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded bg-white shadow-sm" style={{ width: '350px' }}>
        <h2 className="mb-3 text-center">Register</h2>
        {error && <Alert variant='danger'>{error}</Alert>}
        {success && <Alert variant='success'>{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Display Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span className="ms-2">Signing Up...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>

          <div className="mt-3 text-center">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </Form>

        {/* Pop-up email verification */}
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          style={{ zIndex: 9999 }}
          backdropClassName="modal-backdrop-custom"
          dialogClassName="modal-dialog-scrollable"
        >
          <Modal.Header closeButton className="bg-warning text-dark">
            <Modal.Title>
              <i className="bi bi-exclamation-circle me-2"></i>
              Email Verification Required
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="text-center py-4 px-3">
            <div className="mb-3">
              <i className="bi bi-envelope-exclamation" style={{ fontSize: '3rem', color: '#ffc107' }}></i>
            </div>
            <h5 className="mb-4 fw-bold">Verify Your Email to Complete Registration</h5>

            <p className="mb-2">We've sent a verification email to:</p>

            <div className="alert alert-warning mb-3 py-2">
              <strong className="d-block text-break">{userEmail}</strong>
            </div>

            <div className="alert alert-danger mb-3 py-3 text-center">
              <div>
                <strong>Important:</strong> Your account will be automatically deleted if not verified within 30 minutes for security reasons.
              </div>
            </div>

            <p className="text-muted small mb-0">
              Please check your email (including spam folder) and click the verification link. After verification, return to the login page.
            </p>
          </Modal.Body>

          <Modal.Footer className="justify-content-center border-0 pt-0 pb-3">
            <Button variant="primary" onClick={handleCloseModal} className="px-4 py-2">
              I'll Verify My Email
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}