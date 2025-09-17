import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './components/Login.jsx'
import Resgister from './components/Resgister.jsx'
import { UserAuthProvider } from './context/UserAuthContext.jsx'
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
    path:"/resgister",
    element:<Resgister/>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
