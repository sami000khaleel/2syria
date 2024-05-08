import React from 'react'
import At from '../../assets/svgs/nearby.svg'
const YourAtButton = ({userLocation,setUserLocation,setCenter,getUserLocation}) => {
async function handleClick(){
  if(!userLocation.length){
    let res= await getUserLocation()
      if(res.length)  
    setCenter(res)
    return
  
    }
    console.log('location is in')
    setCenter([userLocation[0]+0.001,userLocation[1]+0.0001])
    // setCenter(userLocation)
  }
  return (
    <>
    <button onClick={handleClick} className='w-[70px] hover:text-white shadow-sm  z-30 rounded-full'>
    <img src={At} alt="SVG Image" className='p-1'/>

    </button>
    </>
    )
}

export default YourAtButton