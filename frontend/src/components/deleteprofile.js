import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const api_baseurl = process.env.REACT_APP_API_URL;

const DeleteProfile = () => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const userId = JSON.parse(localStorage.getItem("user"))?.logIn?._id;
  const auth = localStorage.getItem('user');
  useEffect(() => {
    if (!JSON.parse(auth)?.logIn?._id) {
      navigate('/login');
    }
  }, [navigate]);
  const [deleting, setdeleting] = useState(false)
  const navigate = useNavigate();
  const logOut = () => {
  localStorage.removeItem('user');
  navigate('/login')
  }

  const handleDelete = async () => {
    setdeleting(true)
    if (confirmationInput !== 'DELETE') {
      Swal.fire({
        title: 'Error',
        text: 'Please type DELETE to confirm.',
        icon: 'error',
      });
      return;
    }
    try {
      const response = await axios.delete(`${api_baseurl}/api/user`, { data: { userId } });
      Swal.fire({
        title: response.data.message,
        icon: response.data.icon,
      });
      if(response.data.icon == 'success'){
        setTimeout(logOut, 2500)
      }
      setdeleting(false)
    } catch (error) {
      Swal.fire({
        title: 'Error deleting account',
        text: error.response?.data?.message || error.message,
        icon: 'error',
      });
      setdeleting(false)
    }
    setdeleting(false)
  };

  return (
    <div className="bg-gray-900 px-11 py-6 min-h-screen flex flex-col items-center text-center">
        <h2 className="text-2xl text-red-500 font-bold mb-4">Delete Profile</h2>
        <p className="text-gray-300 mb-4">
          Warning: All log data, including photos and account data, will be deleted and cannot be reverted.
        </p>
        <input
          type="text"
          value={confirmationInput}
          onChange={(e) => setConfirmationInput(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded-md"
        />
        <button
          onClick={handleDelete} disabled={deleting}
          className="w-full p-2 bg-red-500 text-white rounded-md disabled:bg-red-400"
        >
          {deleting ? 'Deleting' : 'Delete Account'}
        </button>
    </div>
  );
};

export default DeleteProfile;