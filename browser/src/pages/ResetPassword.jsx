import React, { useState, useEffect } from "react";
import Cookies from "js-cookies";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import SideImage from "../components/SideImage/SideImage";
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
    <main className="min-h-screen w-full  bg-[#1C1D21] text-white grid place-content-center ">
      <section className="flex justify-between  items-center  flex-col md:flex-row">
        <article className="  mr-10 w-full grid min-h-screen sm:w-1/2 place-content-center gap-7  ">
          {!emailVerifiedFlag ? (
            <section
              className="flex justify-center items-start flex-col p-4"
              id="forgot password"
            >
              <h1 className="text-4xl pb-3">type your new password</h1>
              <p className="text-slate-400">
                make sure it is strong
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pt-8 bg-[#1C1D21] w-[100%] border-b-2 py-2 border-slate-600  focus:outline-none focus:pb-4 "
                placeholder="new password"
                name="password"
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
                disabled={loadingFlag ? true : false}
                onClick={handleResetPassword}
                className="mt-8 text-lg w-full py-3 hover:bg-[#ac89e5] rounded-3xl bg-[#9C6FE4]"
              >
                {!loadingFlag ? "change the password" : <h1>loading</h1>}
              </button>
            </section>
          ) : (
            <section id="post code">
              <h1 className="text-4xl pb-3">send us the code</h1>
              <p className="text-slate-400">
                let us make sure it is your email
              </p>
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
                  setEmailVerifiedFlag(false);
                }}
                className="text-slate-400 hover:text-slate-100 hover:bg-slate-700 m-1 p-1 rounded-md"
              >
                go back{" "}
              </button>
              <button
                onClick={handle_submit_code}
                className="mt-8 text-lg w-full py-3 hover:bg-[#ac89e5] rounded-3xl bg-[#9C6FE4]"
              >
                verify{" "}
              </button>
            </section>
          )}
        </article>
        <SideImage />
      </section>
    </main>
  );
};

export default ResetPassword;
