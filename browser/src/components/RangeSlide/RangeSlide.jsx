import React, { useState } from 'react';

const RangeSlide = ({ userLocation,getUserLocation,radius, unit, setRadius, setUnit, radiusFlage, setRadiusFlage }) => {
  function handleRadiusChange(e) {
    setRadius(e.target.value)
      if (!userLocation.length) {
      getUserLocation()
    }
  }

  async function handleChangeUnit(e) {
    e.preventDefault();
  
    setUnit((pre) => {
      if (pre === 'mi') return 'km';
      if (pre === 'km') return 'mi';
      return 'mi';
    });
  }

  return (
    <>
      <span className={`mt-3 w-[80px]  absolute bottom-0`}>
        <label className='flex justify-start items-center' htmlFor="radius">radius:
          <button onClick={(e) => {
            e.preventDefault();
            setRadiusFlage(pre => !pre);
          }} className='w-[19px] h-[19px] flex items-center justify-center   bg-red-500  z-50  top-[0px] right-[10px] rounded-full     hover:bg-slate-100 text-black '>&#10005;</button>
        </label>
        <input disabled={!radiusFlage} className='w-[70px]' type="range" id="radius" value={radius} onChange={handleRadiusChange} name="radius" min="0" max="20" />
        <p className=''>{`${radius}`}<button onClick={handleChangeUnit} className='rounded-full ml-2 cursor-pointer m-0    hover:bg-slate-200 aspect-square'> {unit}</button></p>
      </span>
    </>
  );
};

export default RangeSlide;
