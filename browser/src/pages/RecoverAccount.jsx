import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Cookies from 'js-cookies'
import SideImage from "../components/SideImage/SideImage";
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
  const [error, setError] = useState({ message: "", status: 0 });
  function handleFormInput(e) {
    setError({ message: "" });
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
      window.alert(error.message);
    }
  }
  async function handleRequestCode() {
    try {
      setLoadingFlag(true)
      await api.get_code(user.email);
      setLoadingFlag(false)
      window.alert("code was successfully sent  to " + user.email);
      setEmailVerifiedFlag(true)
    } catch (error) {
      setEmailVerifiedFlag(false)
      setLoadingFlag(false)
      setError({ message: error.message });
      window.alert(error);
    }
  }

  const navigate = useNavigate();
  return (
    <main className="min-h-screen w-full  bg-[#1C1D21] text-white grid place-content-center ">
      <section className="flex justify-between  items-center  flex-col md:flex-row">
        <article className="  mr-10 w-full grid min-h-screen sm:w-1/2 place-content-center gap-7  ">
            {
              !emailVerifiedFlag?
          <section
            className="flex justify-center items-start flex-col p-4"
            id="forgot password"
          >
                <h1 className="text-4xl pb-3">type in your email</h1>
                <p className="text-slate-400">let us make sure that it is yours</p>
                <input
                  type="email"
                  value={user.email}
                  onChange={handleFormInput}
                  className="pt-8 bg-[#1C1D21] w-[100%] border-b-2 py-2 border-slate-600  focus:outline-none focus:pb-4 "
                  placeholder="email"
                  name="email"
                />
                <button
                  onClick={(e) => {
                    navigate("/login");
                  }}
                  className="text-slate-400 hover:text-slate-100 hover:bg-slate-700 m-1 p-1 rounded-md"
                >
                  go back
                </button>
                <button
                disabled={loadingFlag?true:false}
                  onClick={handleRequestCode}
                  className="mt-8 text-lg w-full py-3 hover:bg-[#ac89e5] rounded-3xl bg-[#9C6FE4]"
                >
                  {!loadingFlag?"get the code":<h1>loading</h1>}
                </button>
            </section>  :<section id='post code' >
              <h1 className="text-4xl pb-3">send us the code</h1>
                <p className="text-slate-400">let us make sure it is your email</p>
                <input
                  type="text"
                  value={user.code}
                  onChange={handleFormInput}
                  className="pt-8 bg-[#1C1D21] w-[100%] border-b-2 py-2 border-slate-600  focus:outline-none focus:pb-4 "
                  placeholder="code"
                  name="code"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEmailVerifiedFlag(false)
                  }}
                  className="text-slate-400 hover:text-slate-100 hover:bg-slate-700 m-1 p-1 rounded-md"
                >
go back                 </button>
                <button
                  onClick={handle_submit_code}
                  className="mt-8 text-lg w-full py-3 hover:bg-[#ac89e5] rounded-3xl bg-[#9C6FE4]"
                >
verify                </button>
              </section>
            }
        </article>
        <SideImage />
      </section>
    </main>
  );
};

export default RecoverAccount;
