import React, { useState, useEffect } from "react";
import Cookies from "js-cookies";
import { useNavigate } from "react-router-dom";
import SideImage from "../components/SideImage/SideImage";
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import Brand from '../components/Brand/Brand';
import PrivacyPolicy from '../components/Privacy/PrivacyPolicy';
import api from "../api/api";
const Signup = () => {
  const [privacyOpen, setPrivacyOpen] = React.useState(false);
    const navigate=useNavigate()
  const [error, setError] = useState({ message: "", status: 0 });
  const [user, setUser] = useState({
    email: "",
    userName: "",
    password: "",
    code: "",
  });
  useEffect(() => {
    if (Cookies.getItem("token")) navigate("/");
  }, [navigate]); 
  function handleFormInput(e) {
    setError({ message: "" });
    setUser((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  }
  async function handleSignup(e) {
    e.preventDefault();
    try {
      const { data } = await api.signup(user);
      Cookies.setItem("token", data.token);
      setUser(data.user);
      navigate("/map");
    } catch (err) {
      console.log( err );
      setError({ message: err.response.data.message, status: err.response.status });
    }
  }

  return (
    <main className="min-h-screen w-full bg-sand-50 text-ink-900 dark:bg-ink-950 dark:text-ink-50">

    <section className="grid min-h-screen md:grid-cols-2">
    <article className="relative flex min-h-screen w-full items-center justify-center px-6 py-24">
    <Brand className="absolute left-6 top-6" />
    <ThemeToggle className="absolute right-6 top-5" />
    <section id="signup" className="w-full max-w-sm animate-fade-up">
      <figure className="flex flex-col items-start gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">sign up</h1>
        <p className="text-ink-500 dark:text-ink-300">set your account</p>
      </figure>
      <form className="mt-8 stagger flex flex-col items-stretch gap-4">
        <input
          type="text"
          value={user.userName}
          onChange={handleFormInput}
          className="field"
          placeholder="user name"
          name="userName"
        />
        <input
          type="email"
          value={user.email}
          onChange={handleFormInput}
          className="field"
          placeholder="email"
          name="email"
        />
        <input
          type="password"
          value={user.password}
          onChange={handleFormInput}
          className="field"
          placeholder="password"
          name="password"
        />
        <button
          onClick={handleSignup}
          className="btn-primary mt-2"
        >
          sign up
        </button>
        {error.message ? (
          <p className="w-full rounded-xl border border-star-500/20 bg-star-500/10 px-4 py-2.5 text-center text-sm font-medium text-star-600 dark:text-star-400">{error.message}</p>
        ) : null}
      </form>
      <p className="mt-4 text-center text-xs text-ink-400">
        by signing up you agree to our{" "}
        <button type="button" onClick={() => setPrivacyOpen(true)} className="font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300">privacy policy</button>
      </p>
      <PrivacyPolicy open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <aside className="mt-10 flex items-center justify-between gap-4 border-t border-sand-200 pt-6 dark:border-ink-700">
        <p className="text-sm text-ink-500 dark:text-ink-300">already have an account?</p>
        <button
          onClick={() => navigate('/login')}
          className="btn-secondary"
        >
          log in
        </button>
      </aside>
    </section>
  </article>
    <SideImage/>
  </section>
  </main> )
}

export default Signup;
