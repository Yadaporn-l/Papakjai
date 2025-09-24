import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Alert, Button, Row, Col } from 'react-bootstrap';
import { useUserAuth } from "../context/UserAuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const { signIn, signInWithGoogle, resetPassword } = useUserAuth();
    let navigate = useNavigate();

    // เข้าสู่ระบบแบบปกติ (อีเมล/รหัสผ่าน)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            await signIn(email, password);
            navigate("/homelogin");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // เข้าสู่ระบบด้วย Google
    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        
        try {
            await signInWithGoogle();
            navigate("/homelogin");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    // รีเซ็ตรหัสผ่าน
    const handleReset = async () => {
        if (!email) {
            setError("กรุณาใส่อีเมลก่อนกดรีเซ็ตรหัสผ่าน");
            return;
        }
        setError("");
        setLoading(true);
        
        try {
            await resetPassword(email);
            alert("ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว! กรุณาตรวจสอบใน inbox ของคุณ");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="p-4 rounded bg-white shadow-sm" style={{ width: '400px' }}>
                <h2 className='mb-4 text-center'>เข้าสู่ระบบ</h2>
                
                {error && <Alert variant='danger'>{error}</Alert>}

                {/* Social Login Buttons
                <div className="mb-3">
                    <Row className="g-2">
                        <Col>
                            <Button 
                                variant="outline-danger" 
                                className="w-100 d-flex align-items-center justify-content-center"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                            >
                                <i className="fab fa-google me-2"></i>
                                Google
                            </Button>
                        </Col>
                      
                    </Row>
                </div> */}

                {/* Divider */}
                {/* <div className="text-center mb-3 position-relative">
                    <hr />
                    <span className="bg-white px-3 text-muted position-absolute top-50 start-50 translate-middle">
                        หรือ
                    </span>
                </div> */}

                {/* Email/Password Form */}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>อีเมล</Form.Label>
                        <Form.Control
                            type='email'
                            placeholder="ใส่อีเมลของคุณ"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>รหัสผ่าน</Form.Label>
                        <Form.Control
                            type='password'
                            placeholder="ใส่รหัสผ่าน"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    

                    <div className="d-grid gap-2">
                        <Button 
                            variant='primary' 
                            type='submit'
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                'เข้าสู่ระบบ'
                            )}
                        </Button>
                    </div>

                    {/* Forgot Password */}
                    <div className="mt-3 text-center">
                        <Button 
                            variant="link" 
                            onClick={handleReset}
                            disabled={loading}
                            className="p-0 text-decoration-none"
                        >
                            ลืมรหัสผ่าน?
                        </Button>
                    </div>

                    {/* Register Link */}
                    <div className="p-3 box mt-3 text-center border-top">
                        ยังไม่มีบัญชี? <Link to="/register" className="text-decoration-none">สมัครสมาชิก</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}
