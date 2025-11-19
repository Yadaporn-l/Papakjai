import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './App.css'
import App from './App.jsx'
import EmailVerificationGuard from './components/EmailVerificationGuard.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import { UserAuthContextProvider } from './context/UserAuthContext.jsx'
import Visainfo from './visainfo.jsx'
import Travelguide from './Travelguide.jsx'
import Accomodation from './Accomodation.jsx'
import VisaResult from './visaresult.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import ForgotPassword from './components/ForgotPassword.jsx'


import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>
  },
  {
    path: "/login",
    element: <Login/>
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword/>
  },
  {
    path: "/register",
    element: <Register/>
  },
  {
    path: "/visainfo",
    element: <Visainfo/>
  },
  {
    path: "/visaresult",
    element: <VisaResult/>
  },
  {
    path: "/Travelguide",
    element: 
    <Travelguide/>
    
  },
  {
    path: "/accomodation",
    element: <Accomodation/>
  }
]);

// ตรวจสอบ root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <UserAuthContextProvider> {/* ชื่อให้ตรงกับที่ export ใน UserAuthContext.jsx */}
      <RouterProvider router={router} />
    </UserAuthContextProvider>
  </StrictMode>,
)