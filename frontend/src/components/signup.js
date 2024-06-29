import { Link, BrowserRouter, useNavigate } from 'react-router-dom';
import {useState, useEffect} from 'react';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate()
  const api_baseurl = process.env.REACT_APP_API_URL
  const [alertMessage, setAlertMessage] = useState('');
  useEffect(() => {
    const auth = localStorage.getItem('user');
    if (JSON.parse(auth)?.logIn?._id) {
      navigate('/');
    }
}, []);
  
  const [formData, setFormData] = useState({
    name:'',
    email:'',
    password:'',
    ip:''
  })
  const [signing, setsigning] = useState(false)
  
  const handleChange = (e) => {
    setFormData({
      ...formData, [e.target.name]: e.target.value.trim()
    })
  }
  
  useEffect(() => {
    const fetchIp = async () => {
      try{
        const respIp = await axios.get('https://api.ipify.org?format=json');
        const {ip} = respIp.data;
        setFormData({
          ...formData, ip: ip
        });
      }catch(e){
        console.error(e)
        setFormData({...formData, ip: null})
      }
    }
    fetchIp();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      setsigning(true)
      const response = await axios.post(api_baseurl+'/api/signup', formData);
      if(response.data.signedUp === true){
      navigate('/login', { state: { successMessage: 'Account created successfully. Please proceed to login.' } });
      }else{
        setAlertMessage(response.data.message)
      }
      console.log(response.data);
      
      setFormData({
    name:'',
    email:'',
    password:'',
    ip:''
  })
      
    }catch(error){
      console.error("Error while saving: ", error)
      setsigning(false)
    }
    setsigning(false)
  }
  
  return(
  <div className="container-fluid">
    <div><h1 className="text-center text-3xl font-sans text-gray-800 my-5 font-bold">Sign Up</h1>
<form className="signupForm flex flex-col justify-center px-8 py-2 gap-2.5" onSubmit={handleSubmit}>
    {alertMessage && (
          <div className="alert-toast text-white bg-red-500 p-2 rounded">{alertMessage}</div>
        )}
  <input type="text" name="name" className="border-[1.5px] outline-0 rounded h-9 border-solid border-gray-600 text-[15px] p-2 placeholder:text-gray-500"
  value={formData.name}
  onChange={handleChange}
  placeholder="Name" />
  <input type="text" name="email" className="border-[1.5px] outline-0 rounded h-9 border-solid border-gray-600 text-[15px] p-2 placeholder:text-gray-500"
  value={formData.email}
  onChange={handleChange}
  placeholder="Email" />
  <input type="password" name="password" className="border-[1.5px] outline-0 rounded h-9 border-solid border-gray-600 text-[15px] p-2 placeholder:text-gray-500"
  value={formData.password}
  onChange={handleChange}
  placeholder="Password" />
  <span className="loginLink text-gray-800">Already have an account? <Link to="/login" className="text-purple-800 no-underline">Login Here</Link></span>
  <button type="submit" disabled={signing} className="m-auto px-5 py-1.5 mt-4 text-[15px] text-white bg-gray-800 border-0 rounded disabled:bg-gray-600">{signing ? 'Please wait' : 'Sign up'}</button>
</form></div>
  </div>
  );
}

export default Signup;