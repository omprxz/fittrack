import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Reset = () => {
  const navigate = useNavigate();
  const api_baseurl = process.env.REACT_APP_API_URL;

  const [alertMessage, setAlertMessage] = useState('');
  const [alertMessageColor, setAlertMessageColor] = useState('bg-red-500');
  const [formData, setFormData] = useState({ email: '' });
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setotpSent] = useState(false)
  const [otpVerified, setotpVerified] = useState(false)
  const [otpSending, setotpSending] = useState(false)
  useEffect(() => {
     const auth = localStorage.getItem('user');
    if (JSON.parse(auth)?.logIn?._id) {
      navigate('/logs');
    }
}, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!validateEmail(formData.email)) {
        setAlertMessage('Invalid email format');
        setAlertMessageColor('bg-red-500');
        return;
      }

      const generatedOtp = generateOTP();
      setOtp(generatedOtp);
      setotpSending(true)
      const response = await axios.post(`${api_baseurl}/api/sendotp`, {
        userName: formData.email,
        otp: generatedOtp,
        email: formData.email,
      });

      if (response.data.icon === 'success') {
        setotpSent(true)
        setAlertMessage(response.data.message);
        setAlertMessageColor('bg-green-500');
      } else {
        setAlertMessage(response.data.message);
        setAlertMessageColor('bg-red-500');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setAlertMessage('Error sending OTP');
      setAlertMessageColor('bg-red-500');
      setotpSending(false)
    }
    setotpSending(false)
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === otp) {
      setAlertMessage('OTP verified successfully');
      setAlertMessageColor('bg-green-500');
      setotpVerified(true)
      setOtp('');
    } else {
      setAlertMessage('Invalid OTP');
      setAlertMessageColor('bg-red-500');
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      setAlertMessage('Passwords do not match');
      setAlertMessageColor('bg-red-500');
      return;
    }

    try {
      const response = await axios.post(`${api_baseurl}/api/resetpassword`, {
        userName: formData.email,
        password: newPassword,
      });

      if (response.data.icon === 'success') {
        setAlertMessage('Password reset successfully');
        setAlertMessageColor('bg-green-500');
        navigate('/login', { state: { successMsg: 'Password has been reset. Login to continue.' } });
      } else {
        setAlertMessage('Failed to reset password');
        setAlertMessageColor('bg-red-500');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setAlertMessage('Error resetting password');
      setAlertMessageColor('bg-red-500');
    }
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  return (
    <div className="bg-gray-900 min-h-screen my-0 py-2 px-4">
    <div className="bg-gradient-to-b from-[#3a1c35] via-[#221b3a] to-gray-900 rounded-md py-4">
      <h1 className="text-2xl text-gray-100 font-bold text-center mb-5 mt-3">Reset Password</h1>
      {alertMessage && (
        <div className={`p-2 rounded ${alertMessageColor} text-white text-center mb-4`}>{alertMessage}</div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          disabled={otpSent || otpVerified}
          className="py-1.5 px-3 rounded-md border-2 border-gray-600 outline-none text-gray-200 placeholder:text-gray-300 bg-gray-800"
        />
        <button type="submit" disabled={otpSending} className={`${otpSent ? 'hidden' : 'block'} bg-gray-800 text-white py-2 w-32 rounded disabled:bg-gray-600 shadow-sm shadow-gray-700`}>{otpSending ? 'Sending OTP' : 'Send OTP'}</button>
      </form>
      {otpSent && (
        <div className="mt-4 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={enteredOtp}
            onChange={(e) => setEnteredOtp(e.target.value)}
            className="p-2 rounded border-2 border-gray-600 outline-none text-gray-900"
            disabled={!otp}
          />
          <button onClick={handleVerifyOtp} className={`${otpVerified ? 'hidden' : 'block'} bg-gray-800 text-white py-2 rounded`}>Verify OTP</button>
        </div>
      )}
      {otpVerified && (
        <div className="mt-4 flex flex-col gap-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="p-2 rounded border-2 border-gray-600 outline-none text-gray-900"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-2 rounded border-2 border-gray-600 outline-none text-gray-900"
          />
          <button onClick={handlePasswordReset} className="bg-gray-800 text-white py-2 rounded">Reset Password</button>
        </div>
      )}
      <div className="mt-4 text-gray-300 text-center">
        Remember your password?{' '}
        <Link to="/login" className="text-purple-500 no-underline">Login here</Link>
      </div>
    </div>
    </div>
  );
};

export default Reset;