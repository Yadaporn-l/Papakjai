import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import { UserAuthContextProvider } from './context/UserAuthContext.jsx';
import Visainfo from './visainfo.jsx';
import Homelogin from './homelogin.jsx';
import VisaResult from "./visaresult.jsx";
import Accomodation from './accomodation.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  { path: "/", element: <App/> },
  { path: "/login", element: <Login/> },
  { path: "/register", element: <Register/> },
  { path: "/visainfo", element: <Visainfo/> },
  { path: "/homelogin", element: <Homelogin/> },
  { path: "/visaresult", element: <VisaResult/> },
  {
    path:"/accomodation",element:<Accomodation/>
  }
]);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <UserAuthContextProvider>
      <RouterProvider router={router} />
    </UserAuthContextProvider>
  </StrictMode>
);
