import React, { useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const auth = localStorage.getItem('user');
  
  useEffect(() => {
    if (auth) {
      navigate('/logs');
    }
  }, [navigate]);

  return (
    <>
      {!auth && (
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 flex flex-col justify-center items-center px-5 pt-8">
          <h1 className="text-3xl font-bold text-white mb-5">Welcome to FitTrack</h1>
          <p className="text-white mb-5">
            Where your journey to a healthier you begins!
          </p>
          <p className="text-white mb-5">
            Our intuitive web app empowers users to effortlessly track their body
            weight, height, body fat percentage, and progress through daily photo
            logging.
          </p>
          <p className="text-white mb-5">
            With seamless functionality and user-friendly design, staying committed
            to your health goals has never been easier.
          </p>
        </div>
      )}

      {!localStorage.getItem('user') && (
        <div className="bg-white rounded-lg p-6 pb-4 max-w-md">
          <h2 className="text-lg font-semibold mb-5">Here's what you can do with FitTrack:</h2>
          <ul className="list-disc ml-6">
            <li className="text-base text-gray-800 mb-2">Keep track of things like your weight, height, and body fat.</li>
            <li className="text-base text-gray-800 mb-2">Take photos to see how your body changes over time.</li>
            <li className="text-base text-gray-800 mb-2">FitTrack is a web app where you can log your daily progress, including your body weight, height, and body fat percentage, so you can track your progress every day.</li>
          </ul>
        </div>
      )}

      {!auth && (
        <div className="flex justify-center items-center">
          <Link to="/signup" className="bg-blue-500 text-white font-bold mt-3 mb-8 py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300">
            Get Started
          </Link>
        </div>
      )}
    </>
  );
};

export default HomePage;