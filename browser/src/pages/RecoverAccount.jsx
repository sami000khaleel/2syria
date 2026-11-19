import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Cookies from 'js-cookies'
import SideImage from "../components/SideImage/SideImage";
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import Brand from '../components/Brand/Brand';
import Notice from '../components/Notice/Notice';

const RecoverAccount = () => {
  const [loadingFlag,setLoadingFlag]=useState(false)
  const [emailVerifiedFlag, setEmailVerifiedFlag] = useState(false);
  const [user, setUser] = useState({
    email: "",
    userName: "",
    password: "",
    code: "",
  });
  const [gotCode, setGotCode] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState({ message: "", status: 0 });
  function handleFormInput(e) {
    setError({ message: "" });
    setNotice(null);
    setUser((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  }
  console.log(error);
  async function handle_submit_code() {
    try {
      setLoadingFlag(true)
      const data = await api.submit_code(user.code, user.email);
      console.log(data);
      Cookies.setItem("token", data.token);
      setLoadingFlag(false)
      setUser(data.user);
      navigate('/reset-password')
    } catch (error) {
      setLoadingFlag(false)
      setNotice({ type: "error", text: error?.response?.data?.message || error?.message || "something went wrong, please try again" });
    }
  }
  async function handleRequestCode() {
    try {
      setLoadingFlag(true)
      await api.get_code(user.email);
      setLoadingFlag(false)
      setNotice({ type: "success", text: "we sent a code to " + user.email + " — check your inbox (and spam folder)." });
      setEmailVerifiedFlag(true)
    } catch (error) {
      setEmailVerifiedFlag(false)
      setLoadingFlag(false)
      setError({ message: error.message });
      setNotice({ type: "error", text: error?.response?.data?.message || error?.message || "something went wrong, please try again" });
    }
  }

  const navigate = useNavigate();
  return (
    <main className="min-h-screen w-full bg-sand-50 text-ink-900 dark:bg-ink-950 dark:text-ink-50">

    <section className="grid min-h-screen md:grid-cols-2">
    <article className="relative flex min-h-screen w-full items-center justify-center px-6 py-24">
    <Brand className="absolute left-6 top-6" />
    <ThemeToggle className="absolute right-6 top-5" />
            {
              !emailVerifiedFlag?
          <section
            className="stagger flex w-full max-w-sm flex-col items-stretch"
            id="forgot password"
          >
                <h1 className="text-4xl font-extrabold tracking-tight">type in your email</h1>
                <p className="mt-2 text-ink-500 dark:text-ink-300">let us make sure that it is yours</p>
                <input
                  type="email"
                  value={user.email}
                  onChange={handleFormInput}
                  className="field mt-8"
                  placeholder="email"
                  name="email"
                />
                <Notice notice={notice} className="mt-4" />
                <button
                disabled={loadingFlag?true:false}
                  onClick={handleRequestCode}
                  className="btn-primary mt-6"
                >
                  {!loadingFlag?"get the code":<span className="flex items-center gap-2"><span className="spinner-sm" />loading</span>}
                </button>
                <button
                  onClick={(e) => {
                    navigate("/login");
                  }}
                  className="btn-link mt-4 self-center px-2 py-1"
                >
                  go back
                </button>
            </section>  :<section id='post code' className="stagger flex w-full max-w-sm flex-col items-stretch">
              <h1 className="text-4xl font-extrabold tracking-tight">send us the code</h1>
                <p className="mt-2 text-ink-500 dark:text-ink-300">let us make sure it is your email</p>
                <input
                  type="text"
                  value={user.code}
                  onChange={handleFormInput}
                  className="field mt-8 text-center text-lg font-bold tracking-[0.4em]"
                  placeholder="code"
                  name="code"
                />
                <Notice notice={notice} className="mt-4" />
                <button
                  onClick={handle_submit_code}
                  className="btn-primary mt-6"
                >
verify                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEmailVerifiedFlag(false)
                  }}
                  className="btn-link mt-4 self-center px-2 py-1"
                >
go back                 </button>
              </section>
            }
  </article>
    <SideImage/>
  </section>
  </main>
  );
};

export default RecoverAccount;
