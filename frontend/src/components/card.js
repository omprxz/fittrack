import React from 'react';
import {Link, useParams} from 'react-router-dom';

export default function Card(props) {
  const {logId} = useParams()
  const handleDelete = () => {
    props.handleDeleteConfirmation(props.logId);
  };
  
  return(
    <>
    <div key={props.cardKey} className='rounded-lg bg-gray-900 p-3'>
    <div className="flex justify-around items-center text-white select-none pt-1 pb-4 bg-transparent">
    <p className="rounded bg-red-600 text-white px-4 py-1" onClick={handleDelete}>Delete</p>
    <Link to={`/logs/${props.logId}/view`} className="rounded bg-green-600 px-5 py-1">View</Link>
    <Link to={`/logs/${props.logId}/edit`} className="rounded bg-blue-600 px-5 py-1">Edit</Link>
</div>
    <div className="dateLog flex flex-col rounded bg-clip-border bg-transparent">
          <div className="logPhotos flex flex-row flex-nowrap overflow-auto rounded-lg max-h-64 gap-2 p-3 bg-gray-600" style={{ scrollbarWidth: 'none' }}>
          {
            props.imgs.map((imgid, ind) => ( <img src={`https://lh3.googleusercontent.com/d/${imgid}=w1000`} className="object-cover rounded-xl shadow-md shadow-gray-800" alt="log image" />
            ))}
          
          </div>
          
       <p className="text-center text-gray-200 text-sm mx-auto pt-3">{props.date}
       </p>
          { (props.weight || props.height || props.fat) &&
          <div className="logMeas bg-gray-900 text-gray-200 mr-auto px-4 text-sm flex flex-row flex-wrap overflow-auto w-full justify-around gap-3 py-2">
            { props.weight && <p>Weight: {props.weight} {props.wUnit}</p> }
            { props.height && <p>Height: {props.height} {props.hUnit}</p> }
            { props.fat && <p>Fat: {props.fat} %</p> }
          </div>
          }
          { (props.categs || props.note) &&
          <div className="logMeta mb-0 rounded-lg">
            { props.categs.length > 0 &&
            <div className="logCategs flex flex-wrap gap-y-1.5 gap-x-0 text-gray-200 mt-0.5 mb-0">
            {
              props.categs.map((categ, index) => (
                <span className="bg-white text-black text-sm font-medium me-2 my-1 px-2.5 py-[3px] rounded">{categ}</span>
              ))
            }
            </div>
            }
            {props.note &&
            <p className="logNote text-[0.93rem] my-2 text-white ">
             Note: {props.note}
            </p>
            }
          </div>
          }
        </div>
        </div>
        </>
    )
}