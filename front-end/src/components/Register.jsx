import React, {useState} from 'react'
import {Link, useNavigate, useNavigation} from 'react-router-dom'
import {Form,Alert,Button} from 'react-bootstrap'
import { useUserAuth } from "../context/UserAuthContext.jsx"


export default function Register() {
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState("");
    const {signUp} = useUserAuth();
    
    let navigate = useNavigate(); //หลังจากสมัครจะพาไปหน้าไหน
   const handleSubmit = async(e) => {
    e.preventDefault();
    setError("");
    try {
            await signUp(email, password);
            navigate("/"); // หรือหน้าที่ต้องการให้ไปหลังสมัครสำเร็จ
        } catch (error) {
            setError(error.message);
        }
   }
   
  return (
    <div>
        <h2 className='mb-3'>Resgister</h2>
        {error && <Alert variant='danger'>{error}</Alert>}
        <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-3" controlId="formBasicEmail">
                 <Form.Control
                    type='email'
                    placeholder="Email address"
                    onChange={(e)=> setEmail(e.target.value)}
                 />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
                 <From.Control
                    type='password'
                    placeholder="Password"
                    onChange={(e)=> setPassword(e.target.value)}
                 />
            </Form.Group>
            
            <div className="d-grid gap-2">
                <Button variant='primary' type='submit'>Sign Up</Button>
            </div>
            <div className="p-4 box mt-3 text-center">
                Already have an account?<Link to="/login">Login</Link>
            </div>

        </Form>
    </div>
    
    
  )
}
