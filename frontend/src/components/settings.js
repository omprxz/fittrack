import { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { PaperClipIcon } from '@heroicons/react/20/solid'

export default function Settings() {
  const navigate = useNavigate();
  const auth = localStorage.getItem('user');
  useEffect(() => {
    if (!JSON.parse(auth)?.logIn?._id) {
      navigate('/login');
    }
  }, [navigate]);
  
  return (
    <div>
      <div className="bg-gray-900 pt-4 min-h-screen">
        <h1 className='text-center font-bold mb-3 text-2xl text-white'>Settings</h1>
        <dl className="divide-y divide-gray-500 px-5">
          <div className="px-2 py-1">
            <dt className="text text-gray-100 border-b border-gray-300 py-3 ps-1"><Link to="/profile">Profile</Link></dt>
            <dt className="text text-gray-100 border-b border-gray-300 py-3 ps-1"><Link to="/categories">Categoires</Link></dt>
            <dt className="text text-gray-100 border-b border-gray-300 py-3 ps-1"><Link to="/data">Export Data</Link></dt>
            <dt className="text text-gray-100 border-b border-gray-300 py-3 ps-1"><Link to="/changepassword">Change Password</Link></dt>
            <dt className="text text-gray-100 border-b border-gray-300 py-3 ps-1"><Link to="/reset">Reset Password</Link></dt>
            <dt className="text text-red-500 border-b border-gray-300 py-3 ps-1"><Link to="/deleteprofile">Delete Account & Data</Link></dt>
          </div>
        </dl>
      </div>
    </div>
  )
}