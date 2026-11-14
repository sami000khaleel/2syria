import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import Brand, { SyrianFlag } from '../components/Brand/Brand';
const PageNotFound = () => {
  const navigate=useNavigate()
    return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-sand-50 px-6 text-center text-ink-900 dark:bg-ink-950 dark:text-ink-50">
      <Brand className="absolute left-6 top-6" />
      <ThemeToggle className="absolute right-6 top-5" />
      <SyrianFlag className="mb-8 h-16 w-24 animate-float rounded-lg shadow-xl ring-1 ring-black/10" />
      <p className="mb-2 animate-fade-up text-7xl font-extrabold tracking-tight text-brand-500 dark:text-brand-300">404</p>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-3">Page Not Found</h1>
      <p className="text-lg text-ink-500 dark:text-ink-300 mb-8">The page you are looking for does not exist.</p>
      <button onClick={e=>{
        e.preventDefault()
        navigate('/map')
      }} className="btn-primary w-auto px-8">
        Go back
      </button>
    </div>
  );
};

export default PageNotFound;
