import {useState, useEffect} from 'react';
import { Analytics } from "@vercel/analytics/react"
import { Link, BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Signup from './components/signup';
import Login from './components/login';
import Nav from './components/nav';
import Settings from './components/settings';
import Categories from './components/categories';
import New from './components/new';
import Logs from './components/logs';
import Edit from './components/edit';
import View from './components/view';
import About from './components/about';
import Profile from './components/profile';
import HomePage from './components/home';
import Reset from './components/reset';
import ChangePass from './components/changepass';
import DeleteProfile from './components/deleteprofile';
import DataManagement from './components/DataManagement';

function App() {
  useEffect(() => {
    if (window.location.hostname === "localhost" || window.location.hostname.includes('192') && !window.eruda) {
        const script = document.createElement("script");
        script.src = "//cdn.jsdelivr.net/npm/eruda";
        document.body.appendChild(script);
        script.onload = () => {
            window.eruda.init();
        };
    }
}, []);

  return (
    <div className="App bg-gray-200">
    <BrowserRouter>
    <Analytics />
    <ScrollToTop />
    <Nav/>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/settings" element={<Settings />}></Route>
        <Route path="/categories" element={<Categories />}></Route>
        <Route path="/logs/new" element={<New />}></Route>
        <Route path="/logs/:logId/edit" element={<Edit />}></Route>
        <Route path="/logs/:logId/view" element={<View />}></Route>
        <Route path="/logs" element={<Logs />}></Route>
        <Route path="/about" element={<About />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/data" element={<DataManagement />}></Route>
        <Route path="/changepassword" element={<ChangePass />}></Route>
        <Route path="/deleteprofile" element={<DeleteProfile />}></Route>
        <Route path="/reset" element={<Reset />}></Route>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;