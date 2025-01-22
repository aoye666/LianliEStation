import React from 'react';
import './App.scss';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Market from './pages/Market/Market';
import Template from './pages/Template/Template';
import Auth from "./pages/Auth/Auth";//注册登录页

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Auth />
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
