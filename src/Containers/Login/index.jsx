import React, { useCallback, useState } from "react";
import { WithNavigation } from "../../BasicComponents/WithNavigation";
import { connect } from "react-redux";
import { succMessage, failMessage } from "../../actions/MessagesAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { callPOST } from "../../Globals/ApiUtils";
import { isValidEmail, setUserInfo } from "../../Globals/UtilityFunctions";

const SignInContainer = (props) => {

    const [user, setUser] = useState({
        username : "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const signupHandler = async(e)=>{
        e.preventDefault();
        const {username, password, confirmPassword}= user;
        console.log("user", user);
        const payload ={
            ...user,
            email: username
        }
        if(password != confirmPassword){
            props.failMessage("Password did't match!");
            return false;
        }
        if(!isValidEmail(username)){
            props.failMessage("Invalid Email Address!");
            return false;
        }
        if(password.length === 0){
            props.failMessage("Password should not be empty!");
            return false;
        }
		//btoa(`${usernameOrEmail}:${password}`);// Buffer.from(`${usernameOrEmail}:${password}`, 'utf8').toString('base64');

        const response = await callPOST("/api/auth/signin",payload, { "Content-Type": "application/json"});
        
        if(response.status == 200){
            props.succMessage("Signed up successfully!")
            setUserInfo(response.data);
            props.navigate("/login");
        }else{
            props.failMessage("Something went wrong");

        }
          console.log("response", response);

    };

    const formChangeHandler=(e)=>{
        const {name, value} = e.target;
        const newUser = {
            ...user,
            [name]: value
        }
        console.log("newUser", newUser);
        setUser(newUser);
    }
    return ( 
        <form className="login" onChange={(e) => formChangeHandler(e)}>
            <h2>Welcome, User!</h2>
            <input type="text" placeholder="Email" name="username" />
            <div className="password-field">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                />
                <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="password-toggle"
                    onClick={()=>setShowPassword(!showPassword)}
                />
            </div>
            <div className="password-field">
            <input 
             type={showConfirmPassword ? "text" : "password"}
             placeholder="Confirm Password"
              name="confirmPassword" />
            <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    className="password-toggle"
                    onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
                />
            </div>
            <input type="submit" value="Sign Up" onClick={(e) => signupHandler(e)} />
            <div className="links">
                <a href="#" onClick={()=> props.navigate("/login")}>already have an account?</a>
                <a href="#" onClick={()=> props.navigate("/notes")}>Back</a>
            </div>
        </form>    )
}
const mapDispatchToProps = {
    succMessage,
    failMessage, // This makes the someAction function available as this.props.someAction
  };
export default connect(null, mapDispatchToProps)(WithNavigation(SignInContainer));