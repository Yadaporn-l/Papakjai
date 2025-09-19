import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // นำ useNavigation ออก เพราะไม่ได้ใช้
import { Form, Alert, Button } from 'react-bootstrap';
import { useUserAuth } from "../context/UserAuthContext"; // ตรวจสอบว่า path ถูกต้อง

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { signUp } = useUserAuth(); // เข้าถึงฟังก์ชัน signUp จาก context

    let navigate = useNavigate(); // Hook สำหรับการนำทาง (navigation)

    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกันการ refresh หน้า
        setError(""); // ล้าง error เดิมก่อนเริ่ม process ใหม่

        try {
            // เรียกใช้ฟังก์ชัน signUp จาก context
            await signUp(email, password);
            // ถ้าสมัครสำเร็จ ให้ redirect ไปที่หน้า login
            navigate("/login");
        } catch (error) {
            // ถ้าเกิด error ระหว่างสมัคร ให้แสดงข้อความ error
            setError(error.message);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light"> {/* เพิ่ม Style เพื่อให้ฟอร์มอยู่กลางหน้าจอ */}
            <div className="p-4 rounded bg-white shadow-sm" style={{ width: '350px' }}> {/* กำหนดขนาดและความสวยงามให้กล่องฟอร์ม */}
                <h2 className='mb-3 text-center'>Register</h2>
                {error && <Alert variant='danger'>{error}</Alert>} {/* แสดง Alert หากมี error */}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label> {/* เพิ่ม Label เพื่อดีกับ Accessibility */}
                        <Form.Control
                            type='email'
                            placeholder="Enter email" // เปลี่ยน placeholder ให้ชัดเจนขึ้น
                            value={email} // ควบคุมค่าจาก state
                            onChange={(e) => setEmail(e.target.value)}
                            required // ทำให้ช่องนี้ต้องกรอก
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label> {/* เพิ่ม Label */}
                        <Form.Control
                            type='password'
                            placeholder="Password"
                            value={password} // ควบคุมค่าจาก state
                            onChange={(e) => setPassword(e.target.value)}
                            required // ทำให้ช่องนี้ต้องกรอก
                        />
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button variant='primary' type='submit'>
                            Sign Up
                        </Button>
                    </div>
                    <div className="p-4 box mt-3 text-center">
                        Already have an account? <Link to="/login">Login</Link> {/* ลิงค์ไปหน้า Login */}
                    </div>
                </Form>
            </div>
        </div>
    );
}