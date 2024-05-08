import React from 'react'
import nearby from '../../assets/svgs/nearby.svg'
import { SVG } from 'leaflet'
const Nearby = ({setPlaces,setPlaceIndex,userLocation}) => {
    async function getNearBy(){
        if(!userLocation.length)
        {
            window.alert('plaese give us premission to access you location.')
            return
        }
        let places=await api.getNearby()
    }
  return (
<img   className=' filter rounded-full w-[40px] z-50 cursor-pointer   'onClick={getNearBy} src={nearby} />
    
    )
}

export default Nearby