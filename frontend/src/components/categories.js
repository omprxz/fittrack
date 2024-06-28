import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { useEffect, useState } from "react";
import { PlusIcon, PencilSquareIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";

const MySwal = withReactContent(Swal);

export default function Categories() {
    const api_baseurl = process.env.REACT_APP_API_URL
    const navigate = useNavigate()
    const userId = JSON.parse(localStorage.getItem("user"))?.logIn?._id;
    const auth = localStorage.getItem('user');
  useEffect(() => {
    if (!JSON.parse(auth)?.logIn?._id) {
      navigate('/login');
    }
  }, [navigate]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchData();
    }, [userId]);
    const [checked, setChecked] = useState(false);
    const [checkedList, setCheckedList] = useState([]);
    
    const handleChecked = () => {
    const anyChecked = document.querySelectorAll('.checkCategs:checked').length > 0;
    let checkedHtml = document.querySelectorAll('.checkCategs:checked');
    let checkedListTemp = []
    Array.from(checkedHtml).map((html, index) => {
      checkedListTemp.push(html.value)
    })
    setCheckedList(checkedListTemp)
    setChecked(anyChecked);
};

    const [hidden, setHidden] = useState(true);
    const [managing, setManaging] = useState(false)
    const [manageShow, setManageShow] = useState(true)
    
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

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `${api_baseurl}/api/categories?userId=${userId}`
            );
            if(response.data.categFetched){
               setCategories(response.data.categories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };
    
    const uncheckAll = () => {
    const checkboxes = document.querySelectorAll('.checkCategs');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    setChecked(false);
    setCheckedList([]);
}

    const Edit = (preValue) => {
        MySwal.fire({
            title: "Enter New Value",
            input: "text",
            inputPlaceholder: "Enter new value",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            confirmButtonText: "Update",
            showLoaderOnConfirm: true,
            preConfirm: (newValue) => {
                return axios
                    .put(api_baseurl+"/api/categories", {
                        userId: userId,
                        preValue: preValue,
                        newValue: newValue
                    })
                    .then((response) => {
                        if (response.data.icon === "success") {
                            fetchData();
                            return response.data;
                        } else {
                            throw new Error(response.data);
                        }
                    })
                    .catch((error) => {
                        Swal.showValidationMessage(`Request failed: ${error.message}`);
                    });
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Toast.fire({
                    text: result.value.message,
                    icon: result.value.icon
                });
            }
        });
    };

    const Create = () => {
        MySwal.fire({
            title: "Enter Category Name",
            input: "text",
            inputPlaceholder: "Enter Category Name",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            confirmButtonText: "Create",
            showLoaderOnConfirm: true,
            preConfirm: (categories) => {
                const userId = JSON.parse(localStorage.getItem("user")).logIn
                    ._id;
                return axios
                    .post(api_baseurl+"/api/categories", {
                        userId: userId,
                        categories: categories
                    })
                    .then((response) => {
                        if (response.data.icon == "success") {
                            fetchData();
                            return response.data;
                        } else {
                            throw new Error(response.data.message);
                        }
                    })
                    .catch((error) => {
                        Swal.showValidationMessage(`${error}`);
                    });
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Toast.fire({
                    text: result.value.message,
                    icon: result.value.icon
                });
            }
        });
    };
    
    const Manage = () => {
      if(!managing){
      setHidden(!hidden)
      setManaging(!managing)
      }else{
        if(checked){
          const Delete = async () => {
             const response = await axios.delete(api_baseurl+'/api/categories', {data: {
               userId:userId,
               preValues: checkedList}})
             if(response.status ===200){
               uncheckAll()
               Toast.fire({
                 text: response.data.message,
                 icon:response.data.icon
               })
               fetchData()
               }else{
                 throw new Error (response.data.message)
               }
          }
          Delete()
        }else{
          setHidden(!hidden)
          setManaging(!managing)
        }
      }
    }
return (
  <div className='bg-gray-900 min-h-screen'>
    <h1 className="font-bold text-2xl text-center text-white py-5">Categories</h1>

    <div className="tabs flex justify-center gap-7">
      <Link
        onClick={Create}
        className="w-auto h-9 rounded bg-gray-200 text-black px-6 py-2.5 flex items-center justify-center"
      >
        <PlusIcon className="block h-4 w-4 mr-1.5" aria-hidden="true" />
        New
      </Link>

      {categories.length > 0 &&
        categories.map((item, index) =>
          item.categories.length > 0 && (
            <Link
              key={index}
              className={`w-auto h-9 rounded ${
                manageShow ? "" : "hidden"
              } ${
                checked
                  ? "bg-red-600"
                  : managing
                  ? "bg-green-600"
                  : "bg-blue-600"
              } text-white px-6 py-2.5 flex items-center justify-center`}
              onClick={Manage}
            >
              {checked ? (
                <TrashIcon className="block h-4 w-4 mr-1.5" aria-hidden="true" />
              ) : managing ? (
                <CheckIcon className="block h-4 w-4 mr-1.5" aria-hidden="true" />
              ) : (
                <PencilSquareIcon
                  className="block h-4 w-4 mr-1.5"
                  aria-hidden="true"
                />
              )}
              {checked ? "Delete" : managing ? "Done" : "Manage"}
            </Link>
          )
        )}

    </div>
    <ul className="mt-5 px-12 mx-5 mb-6 flex flex-col text-white">
      {categories.length > 0 && categories[0].categories.length > 0 ? (
        categories[0].categories.map((category, idx) => (
          <li
            key={idx}
            className="text-[1rem] py-2 mb-1 flex gap-2.5 text-gray-200 ps-1 border-b border-gray-400"
          >
            <input
              className={`inline-block checkCategs ${
                hidden ? "hidden" : ""
              }`}
              type="checkbox"
              value={category}
              onChange={handleChecked}
            />
            <p onClick={() => Edit(category)}>{category}</p>
          </li>
        ))
      ) : (
        <div className="text-center my-8 mx-auto text-gray-500">No categories.</div>
      )}
    </ul>
  </div>
);
}
