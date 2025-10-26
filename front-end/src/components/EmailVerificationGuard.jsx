import React, { useEffect, useState } from 'react';
import { useUserAuth } from "../context/UserAuthContext";
import { Alert, Button, Spinner } from 'react-bootstrap';

export default function EmailVerificationGuard({ children }) {
  const { user, logOut, sendVerificationEmail, saveUserToFirestore } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (user) {
        try {
          // รีเฟรช user state เพื่อตรวจสอบสถานะล่าสุด
          await user.reload();
          
          if (!user.emailVerified) {
            console.log("User email not verified, blocking access");
            setLoading(false);
            return;
          }
          
          // หากยืนยันแล้ว ให้บันทึกข้อมูลลง Firestore
          try {
            await saveUserToFirestore(user);
            console.log("Verified user data saved to Firestore");
          } catch (error) {
            console.error("Error saving user data:", error);
          }
          
        } catch (error) {
          console.error("Error checking email verification:", error);
        }
      }
      setLoading(false);
    };

    checkEmailVerification();
  }, [user, saveUserToFirestore]);

  const handleResendVerification = async () => {
    if (user) {
      try {
        setResendLoading(true);
        await sendVerificationEmail(user);
        setMessage("Verification email sent! Please check your inbox.");
      } catch (error) {
        console.error("Failed to resend verification email:", error);
        setMessage("Failed to send verification email. Please try again.");
      } finally {
        setResendLoading(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // หาก user ไม่ได้ login หรือ email ยังไม่ verify
  if (!user || !user.emailVerified) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="p-4 rounded bg-white shadow-sm" style={{ maxWidth: '500px' }}>
          <div className="text-center mb-4">
            <i className="bi bi-shield-exclamation" style={{ fontSize: '4rem', color: '#dc3545' }}></i>
          </div>
          
          <h3 className="text-center mb-4 text-danger">Email Verification Required</h3>
          
          <Alert variant="warning">
            <Alert.Heading>Access Denied</Alert.Heading>
            <p>
              Your email address <strong>{user?.email}</strong> has not been verified yet. 
              For security reasons, you must verify your email before accessing the application.
            </p>
            <hr />
            <div className="alert alert-info">
              <small>
                <strong>Note:</strong> Unverified accounts are automatically deleted after 30 minutes for security purposes.
              </small>
            </div>
          </Alert>

          {message && (
            <Alert variant={message.includes('sent') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}

          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
            
            <Button 
              variant="outline-light text-black border-0.5" 
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              After verifying your email, please refresh this page or sign in again.
            </small>
          </div>
        </div>
      </div>
    );
  }

  // หาก email ถูก verify แล้ว แสดง content ปกติ
  return children;
}