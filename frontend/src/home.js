import { Link, BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import {useState, useEffect} from 'react';
import Nav from './components/nav'

function Home() {
const auth = localStorage.getItem('user')
const navigate = useNavigate()
const logOut = () => {
  localStorage.removeItem('user');
  navigate('/login')
}

  return(
  <>
    <Nav />
  </>
  );
}

export default Home;