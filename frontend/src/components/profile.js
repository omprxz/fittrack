import axios from 'axios'
import { useEffect, useState } from 'react';
import {useNavigate, Link} from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { AiOutlineDelete } from "react-icons/ai";

const MySwal = withReactContent(Swal);

export default function Profile() {
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
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  const [ppChanged, setppChanged] = useState(false)
  const [msg, setmsg] = useState('')
  const [userId, setuserId] = useState(logIn._id)
  const [pp, setpp] = useState(null)
  const [ppPrev, setppPrev] = useState('user.jpg')
  const [name, setname] = useState('')
  const [email, setemail] = useState('')
  const [editMode, seteditMode] = useState(false)
  const [updating, setupdating] = useState(false)
  
  const [weight, setweight] = useState("N/A")
  const [weightUnit, setweightUnit] = useState("N/A")
  const [height, setheight] = useState("N/A")
  const [heightUnit, setheightUnit] = useState("N/A")
  const [fat, setfat] = useState("N/A")
  const [totalLogs, settotalLogs] = useState("N/A")
  const [userSince, setuserSince] = useState("N/A")

  const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};
 
  const fetchUser = async () => {
    const response = await axios.get(`${api_baseurl}/api/user?userId=${logIn._id}`)
    if(response){
      setname(response.data.user.name)
      setemail(response.data.user.email)
      setppPrev(response.data.user.pp ? `https://lh3.googleusercontent.com/d/${response.data.user.pp}=w1000` : 'user.jpg')
      setTimeout(()=>{
      setppPrev(response.data.user.pp ? `https://lh3.googleusercontent.com/d/${response.data.user.pp}=w1000` : 'user.jpg')
      setuserSince(formatDate(response.data.user.created_at) || 'N/A');
      }, 1000)
    }
  }
  
  const fetchUserMeta = async () => {
  try {
    const response = await axios.get(`${api_baseurl}/api/usermeta?userId=${logIn._id}`);
    if (response && response.data && response.data.user) {
      const userMeta = response.data.user;
      setweight(userMeta.weight !== null && userMeta.weight !== undefined && userMeta.weight !== "" ? userMeta.weight : "N/A");
      setheight(userMeta.height !== null && userMeta.height !== undefined && userMeta.height !== "" ? userMeta.height : "N/A");
      setweightUnit(userMeta.weightUnit !== null && userMeta.weightUnit !== undefined && userMeta.weightUnit !== "" ? userMeta.weightUnit : "N/A");
      setheightUnit(userMeta.heightUnit !== null && userMeta.heightUnit !== undefined && userMeta.heightUnit !== "" ? userMeta.heightUnit : "N/A");
      setfat(userMeta.fat !== null && userMeta.fat !== undefined && userMeta.fat !== "" ? userMeta.fat : "N/A");
      settotalLogs(userMeta.totalLogs !== null && userMeta.totalLogs !== undefined && userMeta.totalLogs !== "" ? userMeta.totalLogs : "N/A");
    } else {
      setweight("N/A");
      setheight("N/A");
      setweightUnit("N/A");
      setheightUnit("N/A");
      setfat("N/A");
      settotalLogs("N/A");
    }
  } catch (error) {
    console.error("Error fetching user meta:", error);
    setweight("N/A");
    setheight("N/A");
    setweightUnit("N/A");
    setheightUnit("N/A");
    setfat("N/A");
    settotalLogs("N/A");
  }
};
  
  useEffect(() => {
    fetchUser()
  },[editMode])
  useEffect(() => {
    fetchUserMeta()
  },[])
  
  const handlePpChange = (e) => {
      setppChanged(true)
      let selectedFile = e.target.files[0];
      setpp(selectedFile)
      let reader = new FileReader();
      reader.onloadend = () => {
        setppPrev(reader.result);
      };
      reader.readAsDataURL(selectedFile);
  }
  
  const handleUpdate = async () => {
    if(editMode == false){
      seteditMode(true)
    }else{
    setmsg('')
    setupdating(true)
    if(name==''){
      setmsg('Empty name.')
      return;
    }
    if(!emailRegex.exec(email)){
      setmsg('Invalid email address.')
      return
    }
    
    const profileForm = new FormData()
    profileForm.append('userId', userId)
    profileForm.append('name', name.trim())
    profileForm.append('email', email.trim())
    if(ppChanged){
      profileForm.append('profile', pp)
    }
    try{
    const update = await axios.put(api_baseurl+'/api/user', profileForm,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
      )
    if(update){
      Toast.fire({
        title: update.data.message,
        icon: update.data.icon
      })
      if(update.data.icon == 'success'){
        seteditMode(false)
        setupdating(false)
      }
      
    }else{
      Toast.fire({
        title: "Something went wrong",
        icon: "error"
      })
    }
    
    }catch(e){
      Toast.fire({
        title: "Something went wrong",
        icon: "error"
      })
      seteditMode(false)
      setupdating(false)
    }
    seteditMode(false)
    setupdating(false)
    setpp(null)
    setppChanged(false)
    }
    }
  
const handlePPRemove = async () => {
  try {
    setupdating(true)
    const response = await axios.patch(`${api_baseurl}/api/user/deletepp`, { userId });
    Toast.fire({
      title: response.data.message,
      icon: response.data.icon,
    });
    setupdating(false)
  seteditMode(false)
  setppChanged(false)
  setpp(null)
  } catch (error) {
    Toast.fire({
      title: 'Error deleting profile photo',
      icon: 'error',
    });
  }
  setupdating(false)
};

  
  return(
      <div className="flex flex-col items-center w-full bg-gray-900 min-h-screen py-3 relative">
        <label className="imageDiv relative overflow-hidden mt-4">
          <img src={ppPrev} className="rounded-full aspect-square w-24 object-cover" />
          <div className={`${!editMode || updating ? 'hidden' : 'flex'} absolute bottom-0.5 right-0.5 w-7 h-7 bg-gray-300 rounded-full justify-center items-center`}>
            <label htmlFor="pp"><FaPen className="text-black" /></label>
            <input type="file" id="pp" className='hidden' disabled={!editMode} accept="image/*" onChange={handlePpChange} />
          </div>
        </label>
        <p className={`${editMode ? 'block' : 'hidden'} text-center text-red-600 text-sm mt-4`}>Max Image Size 2MB. (Use Square Image for Better Look)</p>
        {editMode && <div className='text-center mt-4'>
          <button className='text-sm text-red-500 border border-red-600 px-4 py-1.5 bg-transparent rounded disabled:text-red-400 disabled:border-red-400' disabled={updating} onClick={handlePPRemove}><AiOutlineDelete className='inline text-[1rem] me-1' /> Profile Pic</button>
        </div>
        }
        <div className={`${editMode && 'my-2 w-full flex justify-center'}`}>
          <span className={`text-left text-gray-300 ${editMode && 'hidden'}`}>Name: </span>
          <input type="text" className={`${!editMode ? 'bg-gray-900 px-0 text-gray-300 mt-8' : 'px-2.5 text-white bg-gray-800 mt-4'} rounded-lg w-4/5 max-w-md py-2 transition-all duration-200 ease-in-out`} value={name} onChange={(e) => setname(e.target.value)} disabled={!editMode || updating} placeholder="Name" />
        </div>
        <div className={`${editMode && 'my-2 w-full flex justify-center'}`}>
          <span className={`text-left text-gray-300 ${editMode && 'hidden'}`}>Email: </span>
          <input type="email" className={`${!editMode ? 'bg-gray-900 px-0 text-gray-300' : 'px-2.5 text-white bg-gray-800'} rounded-lg w-4/5 max-w-md py-2 transition-all duration-200 ease-in-out`} disabled={!editMode || updating} onChange={(e) => setemail(e.target.value)} value={email} placeholder="Email" />
        </div>
        <div className="text-center mt-3">
          <p className='text-red-600 mb-2'>{msg}</p>
          <button type="button" className="bg-blue-600 rounded-md px-5 py-2 text-white disabled:bg-blue-500" disabled={updating} onClick={handleUpdate}>{editMode ? ( updating ? 'Updating...' : 'Update Profile') : ('Edit Profile')}</button>
        </div>
        <hr className="bg-gray-500 w-full mt-9 mb-5" />
        <p className="text-center text-gray-400 text-lg">Other details</p><p className="text-start text-gray-300 w-3/4 max-w-md mt-4">
  {weight !== "N/A" ? `Weight: ${weight} ${weightUnit !== "N/A" ? weightUnit : ''}` : 'Weight: N/A'}
</p>
<p className="text-start text-gray-300 w-3/4 max-w-md mt-2.5">
  {height !== "N/A" ? `Height: ${height} ${heightUnit !== "N/A" ? heightUnit : ''}` : 'Height: N/A'}
</p>
<p className="text-start text-gray-300 w-3/4 max-w-md mt-2.5">
  {fat !== "N/A" ? `Fat: ${fat}` : 'Fat: N/A'}
</p>
<p className="text-start text-gray-300 w-3/4 max-w-md mt-2.5">
  {totalLogs !== "N/A" ? `Total Logs: ${totalLogs}` : 'Total Logs: N/A'}
</p>
        <p className="text-center text-red-600 text-sm font-medium mt-12 relative underline underline-offset-1"><Link to='/changepassword'>Change Password</Link></p>
        <p className="text-center text-gray-400 text-sm font-medium mt-4 relative">Using FitTrack Since {userSince}.</p>
      </div>
    )
}