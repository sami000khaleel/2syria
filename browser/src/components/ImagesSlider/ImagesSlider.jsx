import React, { useEffect, useState } from "react";
import LeftArrow from '../../assets/svgs/LeftArrow' 
import RightArrow from "../../assets/svgs/RightArrow";
import { ChevronLeft, ChevronRight } from "lucide-react";
import fallbackImage from "../../assets/syrianFlagNew.svg";
import './imageSilder.css'
const ImagesSlider = ({ imagesUrls }) => {
  const [imageIndex, setImageIndex] = useState(0);
  // new place = new photos -> always start again from the first one
  const imagesKey = imagesUrls.join("|");
  useEffect(() => {
    setImageIndex(0);
  }, [imagesKey]);
  // never point past the last photo (e.g. new place has fewer photos)
  const currentIndex = Math.min(imageIndex, Math.max(imagesUrls.length - 1, 0));
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
    <span className="relative block w-full h-full" id="container">
      <div className="flex w-full h-full overflow-hidden">
        {imagesUrls.map(imageUrl => 
          <img
          style={{
            translate:`${-100*currentIndex}%`
          }}
          key={imageUrl}
            
            className={`transition-[translate] duration-500 ease-out shrink-0 grow-0  object-cover block h-full w-full`}
            src={imageUrl}
            loading="lazy"
            onError={(e) => {
              // missing photo -> show the flag instead of a broken image
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackImage;
            }}
            alt="place photo"
          />
        )}

        <button
        id='image-slider'
        aria-label="view next image"
          onClick={showPreviousImage}
          className="z-30 group w-14 h-full flex justify-center items-center absolute top-1/2 -translate-y-1/2 left-0 bg-gradient-to-r from-black/25 to-transparent opacity-80 transition hover:opacity-100 focus-visible:opacity-100"
        >
          <span className="rounded-full bg-white/90 text-ink-900 shadow-lg backdrop-blur h-9 aspect-square flex justify-center items-center transition group-hover:bg-white">
            <ChevronLeft aria-hidden size={22} strokeWidth={2.5} />
          </span>
        </button>
        <button
          aria-label="view previous image"
          id='image-slider'
          onClick={showNextImage}
          className="z-30 group w-14 h-full flex justify-center items-center absolute top-1/2 -translate-y-1/2 right-0 bg-gradient-to-l from-black/25 to-transparent opacity-80 transition hover:opacity-100 focus-visible:opacity-100"
        >
          <span className="rounded-full bg-white/90 text-ink-900 shadow-lg backdrop-blur h-9 aspect-square flex justify-center items-center transition group-hover:bg-white">
            <ChevronRight aria-hidden size={22} strokeWidth={2.5} />
          </span>
        </button>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1.5 backdrop-blur-sm">
        {imagesUrls.map((_,index)=>(
          <button 
            aria-label={`view image number ${index+1}`}
          className="flex h-2 items-center transition duration-100 ease-in-out focus-visible:scale-110 hover:scale-110" onClick={e=>{
            e.preventDefault()
            e.stopPropagation()
            setImageIndex(index)
          }} key={index}>{index===currentIndex?<span aria-hidden className="block h-2 w-5 rounded-full bg-white transition-all" />:<span aria-hidden className="block h-2 w-2 rounded-full bg-white/[.55] transition-all" />}</button>
        ))}
      </div>
    </span>
  );
};

export default ImagesSlider;
