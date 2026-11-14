import React,{useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import SideImage from '../components/SideImage/SideImage';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import Brand from '../components/Brand/Brand';
import api from '../api/api';
import Cookies from 'js-cookies'
const Login = () => {
  const navigate=useNavigate()

  const [error, setError] = useState({ message: "", status: 0 });
  const [user, setUser] = useState({  userName: "", password: "" });
  function handleFormInput(e) {
    setError({ message: "" });
    setUser((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  }
  async function handleLogin(e) {
    e.preventDefault();
    try {
      const { data } = await api.login(user);
      console.log(data)
      setUser(data.user);
      Cookies.setItem("token", data.token);
      navigate('/map')
    } catch (err ) {
      console.log(err)
      setError({ message: err.response.data.message, status: err.response.status });
    }
  }
  return (
    <main className="min-h-screen w-full bg-sand-50 text-ink-900 dark:bg-ink-950 dark:text-ink-50">

    <section className="grid min-h-screen md:grid-cols-2">
    <article className="relative flex min-h-screen w-full items-center justify-center px-6 py-24">
    <Brand className="absolute left-6 top-6" />
    <ThemeToggle className="absolute right-6 top-5" />
    <section id="login" className="w-full max-w-sm animate-fade-up">
    <figure className="flex flex-col items-start gap-2">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">log in</h1>
      <p className="text-ink-500 dark:text-ink-300">
        type in your accounts details
      </p>
    </figure>
    <form className="mt-8 stagger flex flex-col items-stretch gap-4">
      <input
        type="text"
        value={user.userName}
        className="field"
        placeholder="user name"
        onChange={handleFormInput}
        name="userName"
      />
      <input
        type="password"
        value={user.password}
        className="field"
        placeholder="password"
        onChange={handleFormInput}
        name="password"
      />
      <button
        onClick={(e)=>navigate('/recover-account')}
        className="btn-link self-end"
      >
        have you forgotten you are password
      </button>
      <button
        onClick={handleLogin}
        className="btn-primary mt-2"
      >
        login
      </button>
      {error.message ? (
        <p className="w-full rounded-xl border border-star-500/20 bg-star-500/10 px-4 py-2.5 text-center text-sm font-medium text-star-600 dark:text-star-400">{error.message}</p>
      ) : null}
    </form>
    <aside className="mt-10 flex items-center justify-between gap-4 border-t border-sand-200 pt-6 dark:border-ink-700">
      <p className="text-sm text-ink-500 dark:text-ink-300">do not have an account?</p>
      <button
        onClick={() => navigate('/signup')}
        className="btn-secondary"
      >
    create an account
      </button>
    </aside>
  </section> 
  </article>
    <SideImage/>
  </section>
  </main> )
}

export default Login
