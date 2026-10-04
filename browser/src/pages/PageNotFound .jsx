import React from 'react';
import { useNavigate } from 'react-router-dom';
const PageNotFound = () => {
  const navigate=useNavigate()
    return (
    <div className="flex items-center justify-center h-screen flex-col">
      <h1 className="text-5xl font-bold mb-4">Page Not Found</h1>
      <p className="text-xl mb-8">The page you are looking for does not exist.</p>
      <button onClick={e=>{
        e.preventDefault()
        navigate('/map')
      }} className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
        Go back
      </button>
    </div>
  );
};

export default PageNotFound;