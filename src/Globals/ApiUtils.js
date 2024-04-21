import axios from 'axios';
import { getToken, removeAccessToken } from './UtilityFunctions';
import { API_URL } from './Constants';

export const callGET = (url) => {
	// removeAccessToken();
    return axios.get(parameterizedURLAccessToken(url));
}

export const callPOST = async(url, body, header) => {
	let response;
	try{
		 response = await axios.post(parameterizedURLAccessToken(url), body, {
			headers: header
		  });
		
	}catch(e){
		console.log("asaaaaaaaaaa");
		// removeAccessToken();
	}finally{
		return response;
	}
	
}

export const callPUT = (url, body, header) => {
	return axios.put(parameterizedURLAccessToken(url), body, {
	  headers: header
	});
}

export const callPatch = (url, body, header) => {
	return axios.patch(parameterizedURLAccessToken(url), body, {
	  headers: header
	});
}
export const callDELETE = (url,body={}) => {
	return axios.delete(parameterizedURLAccessToken(url),{ data: body });
}
const parameterizedURLAccessToken = (url) => {
	const accessToken = getToken();
	let tokenParameter = "";
	var pattern = new RegExp(/\?.+=.*/g);
	let paramsOperator = "?";
    if(pattern.test(url)) {
    	paramsOperator = "&";
      
    }
	if(accessToken) {
		tokenParameter = paramsOperator+'access_token='+getToken();
	}

	return API_URL+url+tokenParameter;
}
