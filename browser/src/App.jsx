import React,{useEffect,useState} from 'react'
import Map from './pages/Map'
import Cookies from 'js-cookies'
import { useNavigate,Outlet,useLocation } from 'react-router-dom'
const App = () => {
  const location=useLocation()
  const navigate=useNavigate()
 
  useEffect(()=>navigate('/map'),[])
  return (<>
 <Outlet />
  </>
  )
}

export default App