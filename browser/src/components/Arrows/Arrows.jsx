import React from 'react';

const Arrows = ({scrollLeft,scrollRight}) => {
    return (
        <span id='scroll-images' className=' flex space-x-5 absolute bottom-2 right-1/2 translate-x-1/2 z-80'>
           <button  onClick={scrollLeft}
 >

            <svg 
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                color='white'
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather cursor-pointer feather-arrow-left hover:bg-[#9C6FE4] rounded-3xl"
                >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            </button>
                
            <button onClick={scrollRight} >

            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                color='white'
                height="50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather cursor-pointer feather-arrow-left hover:bg-[#9C6FE4] rounded-3xl"
                
            >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
                </button>
        </span>
    );
};

export default Arrows;
