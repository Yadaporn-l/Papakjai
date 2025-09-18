import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import { UserAuthProvider } from './context/UserAuthContext.jsx'

import 'bootstrap/dist/css/bootstrap.min.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path:"/",
    element: <App/>

  },
  {
    path:"/login",
    element:<Login/>
  },
  {
    path:"/register",
    element:<Register/>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserAuthProvider>
      <RouterProvider router={router} />
    </UserAuthProvider>
    
  </StrictMode>,
)
