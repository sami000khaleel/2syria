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
      <span className={`mt-2 block rounded-xl border border-sand-200 bg-sand-50/70 p-3 dark:border-ink-700 dark:bg-ink-850/70`}>
        <label className='flex items-center justify-between gap-3 text-sm font-semibold' htmlFor="radius">radius:
          <button
            aria-label="toggle radius filter"
            aria-pressed={radiusFlage}
            onClick={(e) => {
            e.preventDefault();
            setRadiusFlage(pre => !pre);
          }} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${radiusFlage ? 'bg-brand-500 dark:bg-brand-400' : 'bg-ink-200 dark:bg-ink-700'}`}>
            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${radiusFlage ? 'translate-x-5' : ''}`} />
          </button>
        </label>
        <input disabled={!radiusFlage} className='mt-3 w-full cursor-pointer accent-[#2496E6] disabled:cursor-not-allowed disabled:opacity-40' type="range" id="radius" value={radius} onChange={handleRadiusChange} name="radius" min="0" max="20" />
        <p className='mt-1 flex items-center justify-between text-sm font-semibold text-ink-700 dark:text-ink-200'>{`${radius}`}<button onClick={handleChangeUnit} title="switch unit" className='rounded-lg border border-sand-200 bg-white px-2.5 py-1 text-xs font-bold lowercase text-brand-600 transition hover:border-brand-500 dark:border-ink-700 dark:bg-ink-900 dark:text-brand-300'> {unit}</button></p>
      </span>
    </>
  );
};

export default RangeSlide;
