import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Alert, Button } from 'react-bootstrap';
import { useUserAuth } from "../context/UserAuthContext";

export default function Register() { // ต้องมี "default" ตรงนี้
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { signUp } = useUserAuth();

    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signUp(email, password);
            navigate("/login");
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="p-4 rounded bg-white shadow-sm" style={{ width: '350px' }}>
                <h2 className='mb-3 text-center'>Register</h2>
                {error && <Alert variant='danger'>{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type='email'
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type='password'
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <div className="d-grid gap-2">
                        <Button variant='primary' type='submit'>
                            Sign Up
                        </Button>
                    </div>
                    <div className="p-4 box mt-3 text-center">
                        Already have an account? <Link to="/login">Login</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
}