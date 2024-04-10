import React from "react";
import { useNavigate, useParams } from "react-router-dom";

export const WithNavigation =(Component)=>{
    return props => <Component {...props} navigate={useNavigate()} params = {useParams()} />;

}