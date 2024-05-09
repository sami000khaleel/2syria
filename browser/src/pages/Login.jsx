import React,{useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import SideImage from '../components/SideImage/SideImage';
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
    <main className="min-h-screen w-full  bg-[#1C1D21] text-white grid place-content-center ">

    <section className="flex justify-between  items-center  flex-col md:flex-row">
    <article className="  mr-10 w-full grid min-h-screen sm:w-1/2 place-content-center gap-7  ">
    <section id="login" className="p-8 py-6 w-80 ">
    <figure className="flex justify-start  flex-col  items-start gap-3 ">
      <h1 className="text-5xl text-center ">log in</h1>
      <p className="text-slate-500">
        type in your accounts details
      </p>
    </figure>
    <form className="mt-4  gap-7 flex flex-col  justify-start items-start">
      <input
        type="text"
        value={user.userName}
        className="bg-[#1C1D21] w-[100%] border-b-2 py-2 border-slate-600  focus:outline-none focus:pb-4 "
        placeholder="user name"
        onChange={handleFormInput}
        name="userName"
      />
      <input
        type="password"
        value={user.password}
        className="bg-[#1C1D21] w-full border-b-2 py-2 border-slate-600  focus:outline-none focus:pb-4 "
        placeholder="password"
        onChange={handleFormInput}
        name="password"
      />
      <button
        onClick={(e)=>navigate('/recover-account')}
        className="text-slate-500 hover:text-slate-300"
      >
        have you forgotten you are password
      </button>
      <button
        onClick={handleLogin}
        className="m-auto text-lg w-full py-3 hover:bg-[#ac89e5] rounded-3xl bg-[#9C6FE4]"
      >
        login
      </button>
      {error.message ? (
        <p className="text-red-600 text-center">{error.message}</p>
      ) : null}
    </form>
    <aside className=" flex justify-around pt-10 items-center">
      <p className="text-slate-400">do not have an account?</p>
      <button
        onClick={() => navigate('/signup')}
        className="bg-[#333437] rounded-md p-2 hover:bg-[#555659]"
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