import { Link, BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import {useState, useEffect} from 'react';
import axios from 'axios';

function Login() {
  const [alertMesaage, setAlertMessage] = useState('')
  const [successMesaage, setSuccessMessage] = useState('')
  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMessage(location.state.successMessage);
    }
  }, [location.state]);

  const navigate = useNavigate()
  const api_baseurl = process.env.REACT_APP_API_URL
  useEffect(() => {
    const auth = localStorage.getItem('user');
    if (auth) {
      navigate('/');
  }
}, []);
  
  const [formData, setFormData] = useState({
    email:'',
    password:''
  })
  const handleChange = (e) => {
    setFormData({
      ...formData, [e.target.name]: e.target.value.trim()
    })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try{
    const response = await axios.post(api_baseurl+'/api/login', formData);
    if(response.data.loggedIn === true){
      localStorage.setItem('user', JSON.stringify(response.data.creds));
      navigate('/')
    }else{
       setAlertMessage(response.data.message)
    }
    }catch(e){
      console.error("Error while logging in: ", e)
    }
  }
  
  return(
  <div className="container-fluid">
    <div><h1 className="text-center text-3xl font-sans text-gray-800 my-5 font-bold">Log in</h1>
<form className="loginForm flex flex-col justify-center px-8 py-2 gap-2.5" onSubmit={handleSubmit}>
{
  alertMesaage && <div className="alert-toast text-white bg-red-500 p-2 rounded">{alertMesaage}</div>
}
{
  successMesaage && <div className="alert-toast text-white bg-green-600 p-2 rounded">{successMesaage}</div>
}
  <input type="text" name="email" className="border-[1.5px] outline-0 rounded h-9 border-solid border-gray-600 text-[15px] p-2 placeholder:text-gray-500"
    value={formData.email}
  onChange={handleChange}
  placeholder="Email" />
  <input type="password" name="password" className="border-[1.5px] outline-0 rounded h-9 border-solid border-gray-600 text-[15px] p-2 placeholder:text-gray-500"
   value={formData.password}
  onChange={handleChange}
  placeholder="Password" />
  <span className="loginLink text-gray-800">Don't have an account? <Link to="/signup" className="text-purple-800 no-underline">Create Account</Link></span>
  <span className="loginLink text-gray-800">Lost your password? <Link to="/reset" className="text-purple-800 no-underline">Reset it</Link></span>
  <button type="submit" className="m-auto px-5 py-1.5 mt-4 text-[15px] text-white bg-gray-700 border-0 rounded">Log in</button>
</form></div>
  </div>
  );
}

export default Login;