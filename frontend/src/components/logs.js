import React, {
  useState, useEffect
} from 'react';
import { Link, BrowserRouter,useNavigate, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Card from "./card.js"
import format from 'date-format';
import URL from 'url';
import Datepicker from "react-tailwindcss-datepicker";
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

export default function View(){
  const navigate = useNavigate();
  const auth = localStorage.getItem('user')
  const api_baseurl = process.env.REACT_APP_API_URL
  const cLog = console.log
  const cErr = console.error
  const userId = JSON.parse(auth)?.logIn?._id;
  useEffect(() => {
    if (!JSON.parse(auth)?.logIn?._id) {
      navigate('/login');
    }
  }, [navigate]);
  

  const [logs, setLogs] =useState([])
  const [thisDate, setThisDate] =useState()
  const [categories, setCategories] =useState([])
  const [alertMsg, setalertMsg] = useState("Please wait...")
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  
  const [isLatest, setIsLatest] =useState(true)
  const [query, setQuery] =useState(`userId=${userId}&isLatest=true&start_date=&end_date=&categories=`)
  
  const fetchLogs = async (param) => {
    try{
    const response = await axios.get(`${api_baseurl}/api/logs?${param}`)
    if(response.data.icon == 'success'){
      setLogs(response.data.logs)
      if(response.data.logs.length == 0){
        setalertMsg('No logs found.')
      }
    }else{
        setalertMsg("Can't fetch your logs. Try again later.")
      }
    }catch(e){
       setalertMsg("Can't fetch your logs. Try again later.")
    }
  }
  const fetchCategs = async () => {
    const response = await axios.get(`${api_baseurl}/api/categories?userId=${userId}`)
    if(response.data.categFetched){
      setCategories(response.data.categories[0].categories)
    }
  }
  
  useEffect(() => {
    fetchCategs()
     fetchLogs(query);
  }, [])

function formatDate(isoDate) {
  var formattedDate = format(format.ISO8601_WITH_TZ_OFFSET_FORMAT, new Date(isoDate));

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var month = months[new Date(isoDate).getMonth()];

  var hours = new Date(isoDate).getHours();
  var minutes = new Date(isoDate).getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var time = hours + ':' + minutes + ' ' + ampm;

  return `${new Date(isoDate).getDate()} ${month} ${new Date(isoDate).getFullYear()}, ${time}`;
}

const handleDateChange = newValue => {
    setDateRange(newValue);
    const updatedQuery = new URLSearchParams(query);
    updatedQuery.set("start_date", newValue.startDate);
    updatedQuery.set("end_date", newValue.endDate);
    const queryString = updatedQuery.toString();
    setQuery(queryString);
    fetchLogs(queryString);
  };

const handleLatestChange = () => {
  const updatedQuery = new URLSearchParams(query);
  updatedQuery.set('isLatest', !isLatest);
  setQuery(updatedQuery.toString());
  fetchLogs(updatedQuery.toString());
  setIsLatest(!isLatest)
}
  
const handleCheckboxChange = (id) => {
  let updatedCategoriesString, updatedCategories;
  if (selectedCategories.includes(id.category)) {
       updatedCategories = selectedCategories.filter(item => item != id.category);
    } else {
      updatedCategories = [...selectedCategories, id.category];
    }
  const updatedQuery = new URLSearchParams(query);
  if(updatedCategories.length>0){
    updatedCategoriesString =  JSON.stringify(updatedCategories)
    updatedQuery.set('categories', updatedCategoriesString);
  }else{
    updatedQuery.delete('categories')
  }
  const queryString = updatedQuery.toString();
  setQuery(queryString)
  fetchLogs(queryString)
  setSelectedCategories(updatedCategories);
}

  const Delete = async (logId) => {
    const response = await axios.delete(api_baseurl+'/api/log', {data: {logId: logId}})
    Toast.fire({
      text: response.data.message,
      icon: response.data.icon
    })
    fetchLogs(query)
  }
  
  const handleDeleteConfirmation = (logId) => {
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
    <div className="bg-gradient-to-b from-[#3a1c35] via-[#221b3a] to-[#0b0e14] min-h-screen py-3">
    <p class="text-center text-red-400 mb-3 text-sm">NOTE: Photos may take 2-3 minutes to appear after logging.</p>
<ul className="flex flex-col px-2.5 gap-y-1.5 mb-4">
   <li className="rounded-2xl">
  <Datepicker
        value={dateRange}
        useRange={false}
        toggleClassName="absolute bg-purple-600 text-white right-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed rounded"
        primaryColor={"purple"}
        placeholder="YYYY-MM-DD - YYYY-MM-DD"
        onChange={handleDateChange}
        showShortcuts={true}
        readOnly={true}
        startWeekOn="mon"
        displayFormat={"DD/MM/YYYY"}
        inputClassName="w-full py-2 px-3 text-gray-100 bg-gray-900 outline-none rounded"
      />
    </li>
  <li className="flex justify-between overscroll-none gap-1 border-[1px] border-gray-400 rounded px-1 py-1">
    <input type="checkbox" id="date-order" className="hidden peer" onChange={handleLatestChange} checked={isLatest} />
   <label htmlFor="date-order" className="inline-flex items-center rounded px-5 py-2 shadow-inner shadow-gray-700 w-auto text-gray-900 bg-gray-300 cursor-pointer peer-checked:bg-gray-900 peer-checked:text-white peer-checked:shadow-gray-700">
      <div className="block">
            <div className="text-sm font-bold">{isLatest ? 'Latest' : 'Oldest'}</div>
        </div>
    </label>
    <div className="flex flex-row overflow-x-scroll flex-grow items-center rounded gap-1.5 ms-1.5" style={{ scrollbarWidth: 'none' }} >
    
    {
  (categories.length > 0) ? 
    categories.map((category, index) => (
      <div key={`category-${index}`}>
        <input 
          type="checkbox" 
          id={category} 
          className={`hidden peer`} 
          onChange={() => handleCheckboxChange({category})}
          checked={selectedCategories.includes(category)}
        />
        <label htmlFor={category} className={`inline-flex items-center px-5 py-1.5 my-0.5 rounded shadow-inner shadow-gray-700 text-gray-900 bg-gray-300 cursor-pointer peer-checked:bg-gray-900 peer-checked:text-white peer-checked:shadow-gray-700`}>
          <div className="block whitespace-nowrap">
            <div className="text-sm font-bold">{category}</div>
          </div>
        </label>
      </div>
    ))
  : ( 
    <>
      <p className="text-sm text-gray-300">No categories.</p>
    </>
  )
}
        
    </div>
</li>
 
</ul>
    <p className='text-center my-3'><Link to='/logs/new' className='text-s text-blue-600' >Create New +</Link></p>
      {logs.length > 0 ? (
        <>
          <div className="allLogs">
            <h1 className='font-bold text-2xl my-3 text-center text-white'>Logs</h1>
            <div className="dateLogs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 place-items-center px-8 gap-5 mb-6 mt-1">
              {logs.map((log, index) => (
                <div key={index}>
                
                  <Card cardKey={index} userId={userId} imgs={log.photos} date={formatDate(log.date)} weight={log.weight} wUnit={log.weightUnit} height={log.height} logId={log._id} hUnit={log.heightUnit} fat={log.fat} categs={log.categories} note={log.note}
                  handleDeleteConfirmation={handleDeleteConfirmation}/>
                  
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="py-10 text-center text-gray-800">{alertMsg}</p>
      )}
    </div>
  );
}