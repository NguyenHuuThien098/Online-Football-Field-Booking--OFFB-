import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Home from "./pages/home";
import History from './pages/history';
import Login from './pages/login';
import Report from './pages/report';
import History_FieldBooked from './pages/History_FieldBooked';
import History_Matchjoined from './pages/History_Matchjoined';
import Personal from './pages/Personal.js';

const routers = [
  {
    path: "/",
  element: <Home />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/Report",
    element: <Report />
  },
  {
    path: "/Personal",
    element: <Personal />
  },
  {
    path: "/History_FieldBooked",
    element: <History_FieldBooked />
  },
  {
    path: "/History_Matchjoined",
    element: <History_Matchjoined />
  }
];

const router = createBrowserRouter([...routers]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
