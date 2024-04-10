import { FAIL_MSG, INFO_MSG, SUCCESS_MSG, WARN_MSG } from '../Globals/Constants';
import { popupMsg } from '../Slices/MessageSlice';
import { CLEAR_MESSAGES, MESSAGES } from './ActionTypes';
import { loader } from '../Slices/LoaderSlice';

export const updateMessageState = (type, msg) => {
    return (dispatch) => {
        dispatch(popupMsg({
            type: MESSAGES,
            msgType: type,
            msg: msg
        }));
    };
};


export const clearMessage = () => {
    
	return (dispatch)=> {
        dispatch(popupMsg({type: CLEAR_MESSAGES}))
		
	};
}

export const succMessage = (msg) => {
    return (dispatch) => {
        dispatch(updateMessageState(SUCCESS_MSG, msg));
    };
};

export const failMessage = (msg) => {
	return dispatch => {
		dispatch(updateMessageState(FAIL_MSG, msg));
	};
}

export const warningMessage = (msg) => {
	return dispatch => {
		dispatch(updateMessageState(WARN_MSG, msg));
		const timer = setTimeout(() => {
		    setTimeout(() => dispatch(clearMessage()));
	  	}, 5000);
	};
}

export const infoMessage = (msg) => {
	return dispatch => {
		dispatch(updateMessageState(INFO_MSG, msg));
		const timer = setTimeout(() => {
		    setTimeout(() => dispatch(clearMessage()));
	  	}, 5000);
	};
}

export const loaderAction = (isLoad)=>{
	return dispatch =>{
		dispatch(loader(isLoad))
	}
}