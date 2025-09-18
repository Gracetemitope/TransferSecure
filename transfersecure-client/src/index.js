import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/authPages/Register";
import Login from "./pages/authPages/Login";
import Test from "./components/Test"
import ConfirmEmail from "./pages/authPages/ConfirmEmail";
import ForgotPassword from "./pages/authPages/ForgotPassword";
import ResetPassword from "./pages/authPages/ResetPassword";
import TransferFile from "./pages/TransferFile";
import Settings from "./pages/Settings";
import UploadSuccess from "./components/UploadSuccess";
import DownloadPage from "./pages/DownloadPage";
import ViewProfile from "./components/Profile/ViewProfile";
import UpdateProfile from "./components/Profile/UpdateProfile";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import {AuthProvider} from "./context/AuthContext";
import NotFound from "./pages/NotFound";
import MaliciousFile from "./components/MalciousFile";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
    <BrowserRouter>
        <Routes>
            <Route path="/" element={< App />} />
            <Route path="/register" element={< Register />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/login" element={< Login />} />
            <Route path="/test" element={<Test />} />
            <Route path="confirm" element={<ConfirmEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/transfer" element={<ProtectedRoute><TransferFile /> </ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            {/*<Route path="/malicious-file" element={<ProtectedRoute><MaliciousFile /></ProtectedRoute>} />*/}
            <Route path="malicious" element={<MaliciousFile />} />


            <Route path="/upload-successful" element={
                <ProtectedRoute>
                    <UploadSuccess />
                </ProtectedRoute>
            } />
            <Route path="/download-file" element={<DownloadPage />} />
            <Route path="/profile" element={<ProtectedRoute>
                <ViewProfile />
            </ProtectedRoute>
            } />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                <Dashboard />
                </ProtectedRoute>
            } />

        </Routes>
  </BrowserRouter>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();