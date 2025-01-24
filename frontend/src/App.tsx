import React from 'react';
import './App.scss';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Market from './pages/Market/Market';
import Template from './pages/Template/Template';
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register"


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Login />
      </div>
    ),
  },
  {
    path: "/register",
    element: (
      <div>
        <Login />
      </div>
    ),
  },
  {
    path: "/market",
    element: (
      <div>
        <Market />
      </div>
    ),
  },
  {
    path: "/template",
    element: (
      <div>
        <Template />
      </div>
    ),
  }
]);  

const App: React.FC = () => {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
