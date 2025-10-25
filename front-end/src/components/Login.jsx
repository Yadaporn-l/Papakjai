import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Alert, Button, Spinner, Modal } from 'react-bootstrap';
import { useUserAuth } from "../context/UserAuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  
  const { signIn, sendVerificationEmail, logOut, saveUserToFirestore } = useUserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signIn(email, password);
      const user = userCredential.user;
      
      console.log("User signed in:", user);
      console.log("Email verified:", user.emailVerified);
      
      // ตรวจสอบว่า email ถูก verify แล้วหรือไม่
      if (!user.emailVerified) {
        console.log("Email not verified, signing out user");
        
        // Sign out ผู้ใช้ทันที
        await logOut();
        
        // เก็บข้อมูลผู้ใช้ไว้สำหรับส่ง email verification ใหม่
        setUnverifiedUser(user);
        setShowVerificationModal(true);
        setError(""); // ล้าง error message
      } else {
        // Email ถูก verify แล้ว - บันทึกข้อมูลลง Firestore และอนุญาตให้เข้าสู่ระบบ
        console.log("Email verified, saving user data to Firestore");
        
        try {
          // บันทึกข้อมูล user ลง Firestore
          await saveUserToFirestore(user);
          console.log("User data saved, redirecting to dashboard");
          navigate("/accomodationTarvel"); // หรือหน้าที่ต้องการ
        } catch (firestoreError) {
          console.error("Error saving user data:", firestoreError);
          // แม้ว่าจะบันทึกไม่สำเร็จ ก็ยังให้เข้าสู่ระบบได้
          navigate("/login");
        }
      }
      
    } catch (err) {
      console.error("Login error:", err);
      
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password. Please check your credentials and try again.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed login attempts. Please try again later.");
          break;
        default:
          setError("Login failed. Please try again.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (unverifiedUser) {
      try {
        setLoading(true);
        await sendVerificationEmail(unverifiedUser);
        console.log("Verification email resent successfully");
        
        // แสดงข้อความสำเร็จ
        setError("");
        alert("Verification email sent! Please check your email and try logging in again after verification.");
        
      } catch (error) {
        console.error("Failed to resend verification email:", error);
        setError("Failed to send verification email. Please try again later.");
      } finally {
        setLoading(false);
        setShowVerificationModal(false);
        setUnverifiedUser(null);
      }
    }
  };

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
    setUnverifiedUser(null);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="p-4 rounded bg-white shadow-sm" style={{ width: '350px' }}>
        <h2 className="mb-3 text-center">Login</h2>
        
        {error && <Alert variant='danger'>{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
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
                  <span className="ms-2">Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
          
          <div className="mt-3 text-center">
            <Link to="/forgot-password" className="text-decoration-none">
              Forgot Password?
            </Link>
          </div>
          
          <div className="mt-2 text-center">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </Form>

        {/* Modal แจ้งเตือนให้ verify email */}
        <Modal show={showVerificationModal} onHide={handleCloseVerificationModal} centered>
          <Modal.Header closeButton className="bg-warning text-dark">
            <Modal.Title>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Email Verification Required
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <div className="mb-3">
              <i className="bi bi-envelope-x" style={{ fontSize: '3rem', color: '#ffc107' }}></i>
            </div>
            <h5 className="mb-3">Please Verify Your Email</h5>
            <p className="mb-3">
              Your email address has not been verified yet. You need to verify your email before you can sign in.
            </p>
            <div className="alert alert-warning">
              <strong>{unverifiedUser?.email}</strong>
            </div>
            <p className="text-muted small">
              Check your email (including spam folder) for the verification link, or click below to resend it.
            </p>
          </Modal.Body>
          <Modal.Footer className="justify-content-center">
            <Button 
              variant="warning" 
              onClick={handleResendVerification}
              disabled={loading}
              className="me-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleCloseVerificationModal}
              disabled={loading}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}