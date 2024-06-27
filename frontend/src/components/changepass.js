import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ChangePass = () => {
  const navigate = useNavigate();
  const auth = localStorage.getItem('user');
  useEffect(() => {
    if (!auth) {
      navigate('/login');
    }
  }, [navigate]);
  const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });
  const api_baseurl = process.env.REACT_APP_API_URL
  const logIn = JSON.parse(localStorage.getItem('user')).logIn
  
  const [userId, setuserId] = useState(logIn._id)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async () => {
    if(currentPassword == "" || newPassword == "" || confirmPassword == ""){
      Toast.fire({
        title: 'All fields mandatory',
        icon: 'error'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Toast.fire({
        title: 'Passwords do not match',
        icon: 'error'
      });
      return;
    }

    try {
      const response = await axios.patch(api_baseurl+'/api/user/password', {
        currentPassword,
        newPassword,
        userId
      });

      Toast.fire({
        title: response.data.message,
        icon: response.data.icon
      });
      if(response.data.icon == 'success'){
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      Toast.fire({
        title: error.response.data.message,
        icon: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900">
        <h2 className="text-white text-2xl mt-8 mb-6 text-center font-bold">Change Password</h2>
        <div className="mb-4 w-3/4 max-w-md">
          <label className="block text-gray-300 mb-0.5 text-sm" htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            className="w-full py-2 px-2 rounded bg-gray-800 text-white"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="mb-4 w-3/4 max-w-md">
          <label className="block text-gray-300 mb-0.5 text-sm" htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            className="w-full py-2 px-3 rounded bg-gray-800 text-white"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mb-4 w-3/4 max-w-md">
          <label className="block text-gray-300 mb-0.5 text-sm" htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full py-2 px-3 rounded bg-gray-800 text-white"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handlePasswordChange}
          className="mt-2 py-2 px-5 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Change Password
        </button>
    </div>
  );
};

export default ChangePass;