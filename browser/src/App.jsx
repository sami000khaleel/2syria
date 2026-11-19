import React, { useEffect } from 'react'
import Cookies from 'js-cookies'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'

const App = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // the home address sends visitors to the login page (or straight to the map if already logged in)
  useEffect(() => {
    if (location.pathname === '/')
      navigate(Cookies.getItem('token') ? '/map' : '/login', { replace: true })
  }, [location.pathname])

  return <Outlet />
}

export default App
