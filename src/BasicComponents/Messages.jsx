import React, { useEffect } from 'react';
import { FAIL_MSG, SUCCESS_MSG } from '../Globals/Constants';
import { ToastContainer, toast } from 'react-toastify';
import { connect} from 'react-redux';
import { clearMessage } from '../actions/MessagesAction';
import 'react-toastify/dist/ReactToastify.css';

const Messages = (props) => {
    const { dispMsg, msg, msgType, clearMessage } = props;

    useEffect(() => {
        if (dispMsg) {
            switch (msgType) {
                case SUCCESS_MSG:
                    toast.success(msg);
                    break;
                case FAIL_MSG:
                    toast.error(msg);
                    break;
                default:
                    break;
            }
           
           clearMessage(); // Clear the message after displaying
        }
    }, [dispMsg, msgType, msg, clearMessage]);

    return (
        <div>
            <ToastContainer />
        </div>
    );
}

const mapStateToProps = (state) => ({
    dispMsg: state.messages.dispMsg,
    msg: state.messages.msg,
    msgType: state.messages.msgType,
});

const mapDispatchToProps = (dispatch) => ({
    clearMessage: () => dispatch(clearMessage()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Messages);
