import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import RecoverAccount from './pages/recoverAccount'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Map from './pages/Map'
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";
import ResetPassword from './pages/ResetPassword'
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <App/>
      ),children:[
        {
          path: "/signup",
          element: <Signup/>,
        },
        {
          path: "/map",
          element: <Map/>,
        },
        {
          path: "/login",
          element: <Login/>,
        },
        {
          path: "/recover-account",
          element: <RecoverAccount/>,
        },
        {
          path: "/reset-password",
          element: <ResetPassword/>,
        }
      ]
  }
  
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);