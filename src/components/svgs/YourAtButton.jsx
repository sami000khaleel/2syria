import React from 'react'
import { LocateFixed } from 'lucide-react'
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
    <button
      onClick={handleClick}
      aria-label="go to my location"
      title="my location"
      className='icon-btn h-14 w-14 text-brand-600 dark:text-brand-300'
    >
      <LocateFixed size={24} strokeWidth={2.25} />
    </button>
    </>
    )
}

export default YourAtButton
