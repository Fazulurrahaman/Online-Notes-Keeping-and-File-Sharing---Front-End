import React from "react";
import { WithNavigation } from "./WithNavigation";
import { useDispatch, useSelector } from "react-redux";
import { changeTab } from "../Slices/TabSlice";

const Breadcrumbs = ({ crumbs, onSave, onCancel, navigate }) => {
    const dispatch = useDispatch();
    const clickHandler =(crumb)=>{
        console.log("crumb", crumb);
        navigate(crumb.link)
    }
    return (
        <div>
        <div>
          {crumbs.map((crumb, index) => (
            <span key={index} className= "cursor-pointer" onClick={()=>clickHandler(crumb)}>
              <a>
                {crumb.text}
              </a>
            </span>
          ))}
        </div>
        <button onClick={onSave} style={{float: "right"}} className="add-new">Save</button>
        {/* <button onClick={onCancel}>Cancel</button> */}
      </div>
    );
  };

  export default WithNavigation( Breadcrumbs);