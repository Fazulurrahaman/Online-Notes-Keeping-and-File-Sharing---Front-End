import React, { useEffect, useState } from "react";
import { Nav } from "react-bootstrap";
import { WithNavigation } from "./WithNavigation";
import { useDispatch, useSelector } from "react-redux";
import { changeTab } from "../Slices/TabSlice";

const NavBar =(props)=>{
  // const [tab, setTab] = useState("/share");
  const tab = useSelector(state => state.tab.value);
  const dispatch = useDispatch();


  useEffect(()=>{
    props.navigate(tab);
  },[tab])
  console.log("tab", tab);
 const  onSelectHandler =(tab)=>{
    // setTab(()=>{
    //   props.navigate(tab)
    //   return tab;
    // });
     

  }
    return (
        <div >
        <div className='bs-example row p-2'>
          <Nav variant="pills" activeKey={tab} onSelect={(k)=>dispatch(changeTab(k))} style={{ display: "flex", justifyContent: "center" }}>
            <Nav.Item className="col-5">
              <Nav.Link style={{textAlign: 'center'}} eventKey={"/share"}>Share File</Nav.Link>
            </Nav.Item>
            <Nav.Item className="col-5">
              <Nav.Link style={{textAlign: 'center'}} eventKey={"/notes"}>Notes</Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
      </div>
      )
};

export default WithNavigation(NavBar);