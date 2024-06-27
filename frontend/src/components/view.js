import React, { useState, useEffect } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { IoTrash } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
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

const View = () => {
  const navigate = useNavigate()
  const {logId} = useParams();
  const [logData, setLogData] = useState(null);
  const api_baseurl = process.env.REACT_APP_API_URL
  
  useEffect(() => {
    const fetchLogData = async () => {
      try {
        const response = await axios.get(`${api_baseurl}/api/log?logId=${logId}`);
        if(response.data.log){
        setLogData(response.data.log[0]);
        }
      } catch (error) {
        console.error('Error fetching log data:', error);
      }
    };

    if (logId) {
      fetchLogData();
    }
  }, [logId]);
  
  const handleDownload = async (photoId) => {
    try {
      const response = await axios.get(`https://lh3.googleusercontent.com/d/${photoId}=w1000`, {
        responseType: 'blob'
      });
      saveAs(response.data, `fittrack_${photoId}.jpg`);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  
   const Delete = async () => {
    const response = await axios.delete(api_baseurl+'/api/log', {data: {logId: logId}})
    Toast.fire({
      text: response.data.message,
      icon: response.data.icon
    })
    if(response.data.icon == 'success'){
      navigate('/logs')
    }
  }
  
  const handleDeleteConfirmation = () => {
    Swal.fire({
      title: 'Sure to delete it?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Delete(logId);
      }
    });
  }

  return (
    <>
      <div className="bg-gray-900 py-4 px-6 min-h-screen">
        {logData ? (
          <>
          <p class="text-center text-red-500 mb-3 text-sm">NOTE: Photos may take 2-3 minutes to appear after logging.</p>
          <div className='flex justify-around items-center'>
            <p><IoTrash className='text-red-600 text-2xl' onClick={handleDeleteConfirmation} /></p>
            <h2 className="text-center font-bold text-gray-300 my-3 text-xl">
              {new Date(logData.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
              })}
            </h2>
            <Link to={`/logs/${logId}/edit`}><MdOutlineEdit className='text-blue-600 text-2xl' /></Link>
          </div>
            {logData.weight !== null && logData.height !== null && logData.fat !== null && (<div className="flex sm:flex-col flex-row md:flex-row md:mb-5 sm:gap-4 md:justify-center items-center justify-around mt-6 mb-3 font-bold text-sm text-gray-300">
              {logData.weight !== null && (
                <p>Weight: {logData.weight} {logData.weightUnit}</p>
              )}
              {logData.height !== null && (
                <p>Height: {logData.height} {logData.heightUnit}</p>
              )}
              {logData.fat !== null && (
                <p>Fat: {logData.fat}%</p>
              )}
            </div>)}
            <div className="grid grid-cols-3 gap-y-4 sm:grid-cols-3 md:grid-cols-6 place-items-center text-gray-300 mt-7 mb-3">
              {logData.categories && logData.categories.map((category, index) => (
                <p key={index} className="shadow-sm shadow-gray-600 rounded-b-md px-6 text-sm py-1.5">{category}</p>
              ))}
            </div>
            <div className="flex flex-col items-center md:flex-row md:justify-around md:justify-center md:flex-wrap gap-y-10 mt-8 mb-5">
              {logData.photos && logData.photos.map((photoId, index) => (
                <div key={index} className="relative flex justify-center">
                  <img
                    className="rounded-md w-4/5 max-w-sm shadow-md shadow-gray-700"
                    src={`https://lh3.googleusercontent.com/d/${photoId}=w1000`}
                    alt={`Photo ${index + 1}`}
                  />
                  <div className="absolute bottom-1.5 right-1.5 text-white cursor-pointer" onClick={() => handleDownload(photoId)}>
                    <IoMdDownload className="text-2xl" />
                  </div>
                </div>
              ))}
            </div>
            {logData.note && <p className="text-gray-300 mt-10 mb-8">Note: {logData.note}</p>}
          </>
        ) : 'No log found.'}
      </div>
    </>
  );
};

export default View;