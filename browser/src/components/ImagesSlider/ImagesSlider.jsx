import React, { useState } from "react";
import LeftArrow from '../../assets/svgs/LeftArrow' 
import RightArrow from "../../assets/svgs/RightArrow";
import { ArrowBigLeft, ArrowBigRight,CircleDot,Circle } from "lucide-react";
import './imageSilder.css'
const ImagesSlider = ({ imagesUrls }) => {
  const [imageIndex, setImageIndex] = useState(0);
  function showNextImage(e) {
    e.stopPropagation()
    e.preventDefault();
    setImageIndex((index) => {
      if (index === imagesUrls.length - 1) return 0;
      return ++index;
    });
  }
  function showPreviousImage(e) {
    e.preventDefault();
    e.stopPropagation()
    setImageIndex((index) => {
      if (index === 0) return imagesUrls.length - 1;
      return --index;
    });
  }
  return (
    <span className="relative w-full h-full" id="container">
      <div className="flex w-full h-full overflow-hidden">
        {imagesUrls.map(imageUrl => 
          <img
          style={{
            translate:`${-100*imageIndex}%`
          }}
          key={imageUrl}
            
            className={` trasition duration-300 ease-in-out shrink-0 grow-0  object-cover block h-full w-full`}
            src={imageUrl}
            alt="product image"
          />
        )}

        <button
        id='image-slider'
        aria-label="view next image"
          onClick={showPreviousImage}
          className="z-30 squich hover:bg-[rgba(0,0,0,0.2)] focus-visible:bg-[rgba(0,0,0,0.2)] w-[2rem] b-0 h-full  flex justify-center items-center  absolute top-1/2   -translate-y-1/2 left-0"
        >
          <span className="rounded-full bg-black h-7 aspect-square flex justify-center items-center">
            <ArrowBigLeft  aria-hidden fill="black" stroke="white" size={60} />
          </span>
        </button>
        <button
          aria-label="view previous image"
          id='image-slider'
          onClick={showNextImage}
          className="z-30 hover:bg-[rgba(0,0,0,0.2)] focus-visible:bg-[rgba(0,0,0,0.2)] w-[2rem] b-0 h-full  flex justify-center  items-center  absolute top-1/2   -translate-y-1/2 right-0"
        >
          <span className="rounded-full bg-black h-7 aspect-square flex justify-center items-center">
            <ArrowBigRight aria-hidden fill="black" stroke="white" size={40} />
          </span>
        </button>
      </div>
      <div className="absolute bottom-2 left-1/2  -translate-x-1/2  flex gap-1">
        {imagesUrls.map((_,index)=>(
          <button 
            aria-label={`view image number ${index+1}`}
          className="w-4 h-4  transition  duration-100 ease-in-out focus-visible:scale-110 hover:scale-110 " onClick={e=>{
            e.preventDefault()
            e.stopPropagation()
            setImageIndex(index)
          }} key={index}>{index===imageIndex?<CircleDot aria-hidden height='100%' width='100%' stroke="white" fill="black" />:<Circle aria-hidden stroke="white" fill="black" height='100%' width='100%' />}</button>
        ))}
      </div>
    </span>
  );
};

export default ImagesSlider;
