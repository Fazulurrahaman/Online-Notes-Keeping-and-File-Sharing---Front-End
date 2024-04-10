import React from "react";
import { useSelector } from "react-redux";

const Loader = () =>{
  const isLoading = useSelector(state => state.loader.isLoader);

    return (
      <>
      {
     ( isLoading &&
          <div className="loader-container">
          <div className="loader"></div>
        </div>)
        
      }
      </>
        
      );
};

export default Loader;