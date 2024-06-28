import React, { useState, useRef, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const imgbb_apis = process.env.REACT_APP_IMGBB_API_KEYS.split(",");
const imgbb_api = imgbb_apis[0].trim();
const api_baseurl = process.env.REACT_APP_API_URL;

export default function DataManagement() {
  const navigate = useNavigate()
    const logIn = JSON.parse(localStorage.getItem("user"))?.logIn;
    const userId = JSON.parse(localStorage.getItem("user"))?.logIn?._id;
    const auth = localStorage.getItem('user');
  useEffect(() => {
    if (!JSON.parse(auth)?.logIn?._id) {
      navigate('/login');
    }
  }, [navigate]);
  const [exporting, setExporting] = useState(false);
  const exportButtonRef = useRef(null);

  const uploadToCloud = async (file) => {
    try {
      let formData1 = new FormData();
      formData1.append("image", file);
      formData1.append("key", imgbb_api);
      formData1.append("expiration", 30 * 24 * 60 * 60);

      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        formData1,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data.url;
    } catch (e) {
      console.error(`Error uploading photo to imgBB:`, e);
      throw e;
    }
  };
  
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axios.get(`${api_baseurl}/api/user/export`, {
        params: { userId: logIn?._id }
      });
      const userData = response.data;

      for (const log of userData.logs) {
        if (log.photos && log.photos.length > 0) {
          const imgbbUrls = await Promise.all(
            log.photos.map(async (photoUrl) => {
              try {
                const imgbbUrl = await uploadToCloud(photoUrl);
                return imgbbUrl;
              } catch (error) {
                console.error(`Error uploading photo to imgBB:`, error);
                return null;
              }
            })
          );
          log.photos = imgbbUrls.filter(url => url !== null);
        }
      }

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${logIn.name} FitTrack.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExporting(false);
    } catch (error) {
      setExporting(false);
      Swal.fire({
        title: 'Error exporting data',
        text: error.message,
        icon: 'error'
      });
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen px-6 py-4 flex flex-col items-center md:flex-row md:items-start md:justify-center gap-14">
      <div className="bg-gray-900 rounded-lg shadow shadow-gray-700 text-center w-full py-8 px-5 mt-8">
        <p className="text-gray-300 text-center text-sm mb-7">
          Export and backup all your account data. Downloaded file can be used for importing too.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          ref={exportButtonRef}
          className={`w-4/5 py-1.5 bg-blue-600 rounded-md text-white focus:ring-4 ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
}