import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Link } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Welcome page</h1>
      <img src={reactLogo} alt="React Logo" />
      <br>
      </br>
      <br></br>
      <Link to="/login" className='btn btn-success'>Login</Link>
      <Link to="/register" className='btn btn-primary'>Resgister</Link>
    </>
  )
}

export default App