import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./auth/Register";
import Login from "./auth/Login";
import Test from "./components/Test"
import ConfirmEmail from "./auth/ConfirmEmail";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Routes>
            {/*<Route path="/" component={App} />*/}
            <Route path="/register" element={< Register />} />
            <Route path="/login" element={< Login />} />
            <Route path="/test" element={<Test />} />
            <Route path="confirm" element={<ConfirmEmail />} />
        </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();