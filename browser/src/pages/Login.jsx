import React,{useState,useEffect,useRef} from 'react'
import { useNavigate } from 'react-router-dom';
import SideImage from '../components/SideImage/SideImage';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import Brand from '../components/Brand/Brand';
import api from '../api/api';
import Cookies from 'js-cookies'
import { UserRound, ArrowRight, Check } from 'lucide-react';
import PrivacyPolicy from '../components/Privacy/PrivacyPolicy';
// password of the demo accounts created by the server's seed script (npm run seed)
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "Syria2026!";
const DEMO_COUNT = 4;

const Login = () => {
  const navigate=useNavigate()

  const [error, setError] = useState({ message: "", status: 0 });
  const [user, setUser] = useState({  userName: "", password: "" });
  function handleFormInput(e) {
    setError({ message: "" });
    setSelectedDemo("");
    setUser((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  }
  // demo accounts (fake users from the server's seed script): a click fills in the form
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [selectedDemo, setSelectedDemo] = useState("");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const loginButton = useRef(null);
  useEffect(() => {
    api.getDemoAccounts()
      .then((accounts) => setDemoAccounts(accounts.slice(0, DEMO_COUNT)))
      .catch(() => setDemoAccounts([]));
  }, []);
  function fillDemo(userName) {
    setError({ message: "" });
    setUser({ userName, password: DEMO_PASSWORD });
    setSelectedDemo(userName);
    loginButton.current?.focus();
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
      setError({
        message: err?.response?.data?.message || "could not log in, please try again",
        status: err?.response?.status,
      });
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
        className={`field transition-shadow ${selectedDemo ? "ring-4 ring-brand-500/20 border-brand-400" : ""}`}
        placeholder="user name"
        onChange={handleFormInput}
        name="userName"
      />
      <input
        type="password"
        value={user.password}
        className={`field transition-shadow ${selectedDemo ? "ring-4 ring-brand-500/20 border-brand-400" : ""}`}
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
        ref={loginButton}
        onClick={handleLogin}
        className="btn-primary mt-2"
      >
        {selectedDemo ? <span>log in as <span style={{ textTransform: "none" }}>{selectedDemo}</span></span> : "login"}
      </button>
      {error.message ? (
        <p className="w-full rounded-xl border border-star-500/20 bg-star-500/10 px-4 py-2.5 text-center text-sm font-medium text-star-600 dark:text-star-400">{error.message}</p>
      ) : null}
    </form>
    {demoAccounts.length ? (
      <div className="mt-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-sand-200 dark:bg-ink-700" />
          <span className="section-label">or use a demo account</span>
          <span className="h-px flex-1 bg-sand-200 dark:bg-ink-700" />
        </div>
        <p className="mt-2 text-center text-xs text-ink-400">tap one to fill in the form, then press log in</p>
        <ul className="stagger-fast mt-3 grid grid-cols-2 gap-2.5">
          {demoAccounts.map((account) => {
            const selected = selectedDemo === account.userName;
            return (
              <li key={account.userName}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => fillDemo(account.userName)}
                  className={`group flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/10 ${
                    selected
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/30 dark:border-brand-400 dark:bg-brand-900/30"
                      : "border-sand-200 bg-white hover:border-brand-400 dark:border-ink-700 dark:bg-ink-850 dark:hover:border-brand-500"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-content-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-sm font-bold uppercase text-white">
                    {account.userName[0] || <UserRound size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold" style={{ textTransform: "none" }}>{account.userName}</span>
                    <span className="block text-xs text-ink-400">{account.reviews} reviews</span>
                  </span>
                  {selected ? (
                    <Check size={16} strokeWidth={3} className="shrink-0 text-brand-600 dark:text-brand-300" />
                  ) : (
                    <ArrowRight size={16} className="shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-center text-xs text-ink-400">
          no sign-up needed — we only save the date you log in.{" "}
          <button type="button" onClick={() => setPrivacyOpen(true)} className="font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-300">
            privacy policy
          </button>
        </p>
      </div>
    ) : null}
    <PrivacyPolicy open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
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
