import {Link, useParams, useNavigate} from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import { XMarkIcon } from "@heroicons/react/24/solid";
import withReactContent from "sweetalert2-react-content";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

const MySwal = withReactContent(Swal);
const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

function Edit() {
  const navigate = useNavigate()
  const api_baseurl = process.env.REACT_APP_API_URL
  const {logId} = useParams()
  const cLog = console.log
  const userId = JSON.parse(localStorage.getItem("user"))?.logIn?._id;
  const auth = localStorage.getItem('user');
  useEffect(() => {
    if (!JSON.parse(auth)?.logIn?._id) {
      navigate('/login');
    }
  }, [navigate]);


    const animatedComponents = makeAnimated();

    const colourStyles = {
        control: (styles) => ({
            ...styles,
            backgroundColor: "hsl(215, 27.9%, 16.9%)",
            borderRadius: "0.5rem",
            border: 0,
            cursor: "pointer",
            paddingTop: "4px",
            paddingBottom: "4px"
        }),
        placeholder: (styles) => ({
            ...styles,
            color: "hsl(216, 12.2%, 83.9%)"
        }), 
        
        option: (styles, { isDisabled, isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isSelected
                ? "hsl(215, 27.9%, 16.9%)"
                : isFocused
                ? "hsl(218,3.6%,83.3%)"
                : "hsl(218,3.6%,83.3%)",
            color: isSelected ? "#FFFFFF" : isDisabled ? "#b7b7b7" : "hsl(215,0%,0%)",
            cursor: isDisabled ? "not-allowed" : "pointer",
            ":active": {
                ...styles[":active"],
                backgroundColor: isSelected ? "#00B8D9" : "#93C5FD"
            }
        })
    };
    const [isClearable, setIsClearable] = useState(true);
    const [isSearchable, setIsSearchable] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRtl, setIsRtl] = useState(false);
    const [categOptions, setCategOptions] = useState([]);
    
    const [log, setLog] = useState([])
    const [categories, setCategories] = useState([]);
    const [weight, setWeight] = useState('')
    const [height, setHeight] = useState('')
    const [wUnit, setWUnit] = useState('kg')
    const [hUnit, setHUnit] = useState('inch')
    const [fat, setFat] = useState('')
    const [note, setNote] = useState('')
    const [images, setImages] = useState([]);
    const [deletedImage, setDeletedImage] = useState([]);
    const [fileInputKey, setFileInputKey] = useState("");
    const [imageError, setImageError] = useState("");
    const [date, setDate] = useState("");
    const [alertMsg, setalertMsg] = useState("Please wait...")
    
    
    const maxImage = 8;
    const maxImageSize = 8;
    
    
    const handleMultiChange = (newValue) => {
          setCategories(newValue);
    };
    const handleImageChange = (e) => {
        const files = e.target.files;
        if (files) {
            const newImages = [...images];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (newImages.length < maxImage) {
                    if (file.size < maxImageSize * 1024 * 1024) {
                        setImageError("");
                        newImages.push({
                            id: uuidv4(),
                            file: file,
                            url: URL.createObjectURL(file)
                        });
                    } else {
                        setImageError(
                            `Max File Size Limit is ${maxImageSize} MB`
                        );
                    }
                } else {
                    setImageError(`Max ${maxImage} images allowed only`);
                }
            }
            setImages(newImages);
            setFileInputKey(uuidv4());
        }
    };
    const handleDeleteImage = (id) => {
      console.log(images.length)
  if(images.length != 1){
  const deletedImageUrl = images.find((image) => image.id === id)?.url;
  if (deletedImageUrl) {
    const filename = deletedImageUrl.substring(deletedImageUrl.lastIndexOf('/') + 1).split('=')[0];
    setDeletedImage([...deletedImage, filename]);
    setImages(images.filter((image) => image.id !== id));
    setFileInputKey(uuidv4());
    if (images.length < maxImage + 1) {
      setImageError("");
    } else {
      setImageError("Max 8 images allowed only");
    }
  }
  }else{
    Toast.fire({
      title: 'There must be at least one image.',
      icon: 'warning'
    })
  }
};
    const convertToKolkataTime = (dateString) => {
    var parsedDate = new Date(dateString);
    var kolOffset = 5.5 * 60 * 60 * 1000;
    var kolTime = new Date(parsedDate.getTime() + kolOffset);
    var formattedDate = kolTime.toISOString().slice(0, 19).replace('T', ' ');
    return formattedDate;
}

var dateReceived = "2024-04-26T08:37:00.000Z";
var kolTime = convertToKolkataTime(dateReceived);
    
    const preUrlImg = `https://lh3.googleusercontent.com/d/`;
    const postUrlImg = '=w1000';
    
    const Save = async (e) => {
    e.preventDefault();
    let cLog = console.log
    let categFinal = categories.map(c => c.value)
    const formData = new FormData();

    formData.append("userId", userId);
    formData.append("logId", logId);
    formData.append("date", date);
    
    let updatedImagetoSend = images.filter(img => img.file);

    updatedImagetoSend.forEach((image, index) => {
        formData.append(`photos`, image.file);
    });
    formData.append('deletedImage', JSON.stringify(deletedImage))
    formData.append("categories", JSON.stringify(categFinal));
    formData.append("weight", weight);
    formData.append("weightUnit", wUnit);
    formData.append("height", height);
    formData.append("heightUnit", hUnit);
    formData.append("fat", fat);
    formData.append("note", note);

    try {
        setIsLoading(true);
        const response = await axios.put(api_baseurl+"/api/log", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        Toast.fire({
            text: response.data.message,
            icon: response.data.icon,
        });
        if(response.data.icon == 'success'){
          window.location.reload()
        }

    } catch (error) {
        console.error("Error saving data:", error);
         Toast.fire({
            text: "Error saving log",
            icon: "error",
        });
    } finally {
        setIsLoading(false);
    } 
};
    const fetchData = async () => {
        try {
            const response = await axios.get(
                `${api_baseurl}/api/categories?userId=${userId}`
            );

            const options = response.data.categories.flatMap((item) =>
                item.categories.map((category) => ({
                    value: category,
                    label: category
                }))
            );
            setCategOptions(options);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };
    const fetchLog = async (param) => {
      const response = await axios.get(`${api_baseurl}/api/log?${param}`)
      if(response.data.icon == 'success' && response.data.log){
        let logTemp = response.data.log
         setLog(response.data.log)
        // setImages([...logTemp[0].photos]);
          const updatedImages = logTemp[0].photos.map(photo => preUrlImg + photo + postUrlImg);
            setFileInputKey("");
            const categoriesObjects = logTemp[0].categories.map(category => ({ value: category, label: category }));
            const photosObject = logTemp[0].photos.map(photo => ({ url: preUrlImg+photo+postUrlImg, id:uuidv4() }));
            setImages(photosObject)
            setCategories(categoriesObjects);
            setWeight(logTemp[0].weight);
            setWUnit(logTemp[0].weightUnit);
            setHeight(logTemp[0].height);
            setHUnit(logTemp[0].heightUnit);
            setFat(logTemp[0].fat);
            setNote(logTemp[0].note);
            setDate(convertToKolkataTime(logTemp[0].date))
      }else{
        setalertMsg("This log has been either deleted or you don't have its access.")
      }
    }
    
    useEffect(() => {
        fetchData();
    }, [isLoading]);
    useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const day = now.getDate().toString().padStart(2, "0");
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const datetime = `${year}-${month}-${day}T${hours}:${minutes}`;
        setDate(datetime);
    }, []);
    useEffect(() => {
      fetchLog(`logId=${logId}&userId=${userId}`)
    },[])
    
    return (
        <div className="container mx-auto px-4 bg-gray-900 pt-5 min-h-screen">
        <h1 className="text-center mb-3 font-bold text-2xl text-white">Edit Log</h1>
        {log.length > 0 ? ( <>
        <p class="text-center text-red-500 mb-3 text-sm">NOTE: Photos may take 2-3 minutes to appear after logging.</p>
        {log.map((item) => (
            <form key={item._id} onSubmit={Save} encType="multipart/form-data">
                <div className="flex justify-center mt-5">
                    <div className="w-full">

                        <input
                            type="datetime-local"
                            id="date"
                            name="date"
                            className="mt-1 block w-full h-9 rounded-md border-gray-300 text-white shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 appearance-none text-center rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>

              
<div className="flex items-center justify-center w-full mt-5">
    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-80 h-44 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
  xmlns="http://www.w3.org/2000/svg"
  xmlSpace="preserve"
  className="w-20 h-20"
  style={{
    shapeRendering: "geometricPrecision",
    textRendering: "geometricPrecision",
    imageRendering: "optimizeQuality",
    fillRule: "evenodd",
    clipRule: "evenodd",
  }}
  viewBox="0 0 6.827 6.827"
>
  <defs>
    <style>
      {`.fil6{fill:#dfdfdf}.fil0,.fil3{fill:#b5b5b6;fill-rule:nonzero}.fil0{fill:#d8d8d8}`}
    </style>
  </defs>
  <g id="Layer_x0020_1">
    <path
      className="fil0"
      d="M3.718 2.4s.022.23.151.38l.1.356-.65.35-.56-.296.19-.422s.09-.138.09-.393c0 0-.053-.074-.083-.177 0 0-.103-.143-.098-.482l.01-.339.226-.26.373-.04.374.231c.14.42.17.512-.123 1.091z"
    />
    <path
      d="M2.858 1.716S2.662.873 3.42.838c0 0 .634-.048.524.867 0 0-.082-.46-.555-.46 0 0-.503-.05-.532.471z"
      style={{ fill: "#232323", fillRule: "nonzero" }}
    />
    <path
      className="fil0"
      d="M4.235 2.939s.314-.029.547.257c0 0 .39.19.285.735.073-.13.126-.217.256-.518 0 0 .01-.096.104-.113.024-.028.038-.074.113-.082.034-.04.074-.076.156-.058.062-.01.138.06.18.133.08.097.154.232.037.361-.002.066-.045.1-.106.11-.01.062-.05.106-.116.105-.026.062-.052.106-.141.1-.114.249-.492 1.926-1.21.062l-.482-.502.377-.59zM2.584 2.96s-.306-.05-.539.236c0 0-.391.19-.285.735-.073-.13-.126-.217-.256-.518 0 0-.01-.096-.104-.113-.024-.028-.039-.074-.113-.082-.035-.04-.074-.076-.157-.058-.061-.01-.137.06-.179.133-.08.097-.154.232-.037.361.001.066.044.1.105.11.01.062.05.106.116.105.027.062.053.106.142.1.114.249.492 1.926 1.21.062l.482-.502-.385-.57z"
    />
    <path
      d="m2.584 2.96.37-.189s.517.402.888-.024l.393.192s-.342.653.105 1.092c0 0-.131 1 .1 1.809 0 0-1.232.331-2.08 0 0 0 .265-1.147.127-1.81 0 0 .328-.7.097-1.07z"
      style={{ fill: "#6a6a6a", fillRule: "nonzero" }}
    />
    <path
      className="fil3"
      d="M1.76 3.931c.084.096.234.278.266.48.022-.218-.222-.572-.28-.594-.006.044.017.144.014.114zM5.068 3.931c-.085.096-.235.278-.267.48-.022-.218.223-.572.28-.594.006.044-.017.144-.013.114z"
    />
    <path
      d="M2.955 2.771s.516.402.887-.024h.001a.804.804 0 0 1-.124-.332.397.397 0 0 1-.338.172.395.395 0 0 1-.342-.18c-.007.235-.09.36-.09.36l-.004.01.01-.006z"
      style={{ fill: "#c9c9c9" }}
    />
    <path
      d="M3.413 3.03c.205 0 .382-.076.473-.188a.315.315 0 0 0 .037-.056l-.08-.038-.001-.001c-.37.426-.887.024-.887.024l-.01.005-.053.028c.075.136.368.226.521.226z"
      style={{ fill: "#767676" }}
    />
    <path
      className="fil6"
      d="m3.376 3.688.098.279.32-.085-.26.255.1.278-.258-.12-.259.256.1-.33-.26-.12.32-.083zM2.864 4.315l.033.095.11-.03-.089.088.034.095-.088-.041-.088.087.034-.112-.089-.041.11-.029zM3.963 3.838l.033.095.11-.03-.089.088.034.095-.088-.041-.088.087.034-.112-.089-.041.11-.029z"
    />
    <path style={{ fill: "none" }} d="M0 0h6.827v6.827H0z" />
  </g>
</svg>
            
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload and add images</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">JPG, JPEG or PNG supported only</p>
           {imageError && <p className="mt-3 text-xs text-red-500 dark:text-red-400">{imageError}</p>}
        </div>
        <input 
    key={fileInputKey} 
    type="file" 
    id="dropzone-file"
    accept=".jpg, .jpeg, .png" 
    multiple 
    className="hidden" 
    onChange={handleImageChange} 
/>
    </label>
</div> 
      <div className="mt-4 mb-5 grid grid-cols-3 gap-3">
        {images.map((image) => (
          <div key={image.id} className="relative">
            <img src={image.url} alt="preview" className="w-full h-auto aspect-square rounded shadow-sm shadow-gray-600 object-cover" />
            <span 
              className="absolute top-0 right-0 bg-red-500 rounded-full text-white p-1 m-1.5 cursor-pointer"
              onClick={() => handleDeleteImage(image.id)}
            >
              <XMarkIcon className="block w-3 h-3" aria-hidden="true" />
            </span>
          </div>
        ))}
      </div>
      


                <div>
                    <CreatableSelect
                        isClearable
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        isMulti
                        options={categOptions}
                        placeholder="Select categories..."
                        styles={colourStyles}
                        formatCreateLabel={(inputValue) =>
                            `Create: ${inputValue}`
                        }
                        value={categories}
                        onChange={(newValue) => handleMultiChange(newValue)}
                    />
                </div>
                
                
      <p className="text-left mt-3 text-white font-bold">Measurements</p>
      <div className="relative shadow-sm mt-1">
        <input
          type="number"
          min={0}
          max={1000}
          name="weight"
          id="weight"
          className="block w-full rounded-md border-0 bg-gray-800 py-2 pl-2 pr-20 text-gray-200 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <label htmlFor="weight" className="sr-only">
            Weight
          </label>
          <select
            id="weightUnit"
            name="weightUnit"
            className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            value={wUnit}
            onChange={(e) => setWUnit(e.target.value)}
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>
      </div>
      
      <div className="relative shadow-sm mt-3">
        <input
          type="number"
          min={0}
          max={1000}
          name="height"
          id="height"
          className="block w-full rounded-md border-0 py-2 pl-2 pr-20 bg-gray-800 text-gray-200 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <label htmlFor="height" className="sr-only">
            Height
          </label>
          <select
            id="heightUnit"
            name="heightUnit"
            className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            value={hUnit}
            onChange={(e) => setHUnit(e.target.value)}
          >
            <option value="inch">inch</option>
            <option value="cm">cm</option>
          </select>
        </div>
      </div>
      
      <div className="relative mt-3 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">%</span>
        </div>
        <input
          type="number"
          min={0}
          max={1000}
          name="fat"
          className="block w-full rounded-md border-0 py-2 pl-10 bg-gray-800 text-gray-200 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Fat Percentage"
           value={fat}
           onChange={(e) => setFat(e.target.value)}
        />
      </div>
      
      <div className="mt-3">
        <p className='text-white text-[0.93rem] mb-1 font-bold'>Note:</p>
        <textarea id="note" rows="4" className="block p-2.5 w-full text-sm text-gray-200 bg-gray-800 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 outline-0" placeholder="Log notes..."  value={note}
            onChange={(e) => setNote(e.target.value)}></textarea>
  
  
      </div>
      <div className="flex justify-center py-4">
       <button 
    type="submit" 
    className="bg-gray-200 hover:bg-gray-300 text-black focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg px-6 py-2 my-2"
    disabled={isLoading}
>
    {isLoading ? "Updating..." : "Update"}
</button>
      </div>
                
            </form>
            ))}
             </>
        ) : (
          <p className='text-center text-gray-300 my-12 px-5 text-sm'>{alertMsg}</p>
          )}
        </div>
    );
}

export default Edit;