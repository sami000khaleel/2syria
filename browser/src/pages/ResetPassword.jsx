import React, { useState, useEffect } from "react";
import Cookies from "js-cookies";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import SideImage from "../components/SideImage/SideImage";
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import Brand from '../components/Brand/Brand';

import axios from "axios";
const ResetPassword = () => {
    const navigate=useNavigate()
  const [loadingFlag, setLoadingFlag] = useState(false);
  const [emailVerifiedFlag, setEmailVerifiedFlag] = useState(false);
  const [password, setPassword] = useState("");
  async function handleResetPassword(){
    try {
        setLoadingFlag(true)
        await api.resetPassword(password)
        setLoadingFlag(false) 
        window.alert('password has been changed successfully')
        navigate('/map')
    } catch (err) {
        console.log(err)
        setLoadingFlag(false)
        window.alert(err.response.data.message)

    }
  }
  return (
    <main className="min-h-screen w-full bg-sand-50 text-ink-900 dark:bg-ink-950 dark:text-ink-50">

    <section className="grid min-h-screen md:grid-cols-2">
    <article className="relative flex min-h-screen w-full items-center justify-center px-6 py-24">
    <Brand className="absolute left-6 top-6" />
    <ThemeToggle className="absolute right-6 top-5" />
          {!emailVerifiedFlag ? (
            <section
              className="stagger flex w-full max-w-sm flex-col items-stretch"
              id="forgot password"
            >
              <h1 className="text-4xl font-extrabold tracking-tight">type your new password</h1>
              <p className="mt-2 text-ink-500 dark:text-ink-300">
                make sure it is strong
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field mt-8"
                placeholder="new password"
                name="password"
              />
              <button
                disabled={loadingFlag ? true : false}
                onClick={handleResetPassword}
                className="btn-primary mt-6"
              >
                {!loadingFlag ? "change the password" : <span className="flex items-center gap-2"><span className="spinner-sm" />loading</span>}
              </button>
              <button
                onClick={(e) => {
                  navigate("/login");
                }}
                className="btn-link mt-4 self-center px-2 py-1"
              >
                go back
              </button>
            </section>
          ) : (
            <section id="post code" className="stagger flex w-full max-w-sm flex-col items-stretch">
              <h1 className="text-4xl font-extrabold tracking-tight">send us the code</h1>
              <p className="mt-2 text-ink-500 dark:text-ink-300">
                let us make sure it is your email
              </p>
              <input
                type="text"
                value={user.code}
                onChange={handleFormInput}
                className="field mt-8 text-center text-lg font-bold tracking-[0.4em]"
                placeholder="code"
                name="code"
              />
              <button
                onClick={handle_submit_code}
                className="btn-primary mt-6"
              >
                verify{" "}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setEmailVerifiedFlag(false);
                }}
                className="btn-link mt-4 self-center px-2 py-1"
              >
                go back{" "}
              </button>
            </section>
          )}
  </article>
    <SideImage/>
  </section>
  </main>
  );
};

export default ResetPassword;
