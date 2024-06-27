import React from "react";
import "./About.css";

function AboutPage() {
  return (
    <div className="about-page bg-gray-900">
      <div className="about-content">
        <h1 className="about-title text-white font-bold text-[2rem]">Welcome to FitTrack</h1>
        <p className="about-description text-gray-300">
          FitTrack is your ultimate fitness companion, designed to help you
          track and manage your health and fitness journey with ease.
        </p>
        <p className="about-description text-gray-300">
          Whether you're aiming to lose weight, build muscle, or simply
          maintain a healthy lifestyle, FitTrack provides you with the tools
          and insights you need to achieve your goals.
        </p>
        <h2 className="about-subtitle text-gray-100">Key Features:</h2>
        <ul className="about-feature-list text-gray-300">
          <li className="about-feature-item">
            Track physical measurements such as weight, height, and body fat
            percentage.
          </li>
          <li className="about-feature-item">
            Upload progress photos to visually document your journey.
          </li>
          <li className="about-feature-item">
            Log exercise routines, nutrition intake, and overall well-being.
          </li>
          <li className="about-feature-item">
            Customize categories and tags to organize your entries.
          </li>
          <li className="about-feature-item">
            Receive real-time feedback and motivational messages.
          </li>
        </ul>
        <p className="about-description text-gray-300">
          With FitTrack, taking control of your fitness has never been easier.
          Join thousands of users worldwide who are transforming their lives
          with our intuitive and powerful fitness logging system.
        </p>
        <p className="about-description text-gray-300">
          Get started today and embark on your journey to a healthier, happier
          you with FitTrack!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;