import { createSlice } from '@reduxjs/toolkit'
import { CLEAR_MESSAGES, MESSAGES } from '../actions/ActionTypes';

export const MessageSlice = createSlice({
  name: 'Messages',
  initialState: {
    dispMsg : false,
	msgType : null,
	msg : null,
  },
  reducers: {
    popupMsg: (state, action) => {
        // console.log("state, action", state, action);
        switch( action.payload.type ) {

        case MESSAGES : {
            const data ={
                ...state,
                dispMsg : true,
                msgType: action.payload.msgType,
                msg : action.payload.msg,
        }
        console.log("action", action, "\n state", state, "\n data", data);

        return data;
    }
        case CLEAR_MESSAGES :{
            console.log("CLEAR_MESSAGES - Invoked");
			return {
				...state,
				dispMsg : false,
				msgType: null,
				msg : null,
			}
        }
        default :
        return state;   
        }
          
    }
  }
})

// Action creators are generated for each case reducer function
export const { popupMsg } = MessageSlice.actions;

export default MessageSlice.reducer;