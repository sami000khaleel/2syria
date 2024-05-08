import React,{useEffect,useState} from 'react'
import Map from './pages/Map'
import Cookies from 'js-cookies'
import { useNavigate,Outlet,useLocation } from 'react-router-dom'
const App = () => {
  const location=useLocation()
  const navigate=useNavigate()
 
  const [mapFlag,setMapFlag]=useState(false)
  useEffect(()=>Cookies.getItem('token')?navigate('/map'):()=>null,[location.pathname])
  return (<>
 <Outlet />
  </>
  )
}

export default App