import React, { useCallback, useEffect, useState } from "react";
import { WithNavigation } from "../../BasicComponents/WithNavigation";
import { connect } from "react-redux";
import { succMessage, failMessage } from "../../actions/MessagesAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { callGET, callPOST } from "../../Globals/ApiUtils";
import { getUserInfo, setUserInfo } from "../../Globals/UtilityFunctions";

const LogInContainer = (props) => {

    const [user, setUser] = useState({
        usernameOrEmail : "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(()=>{
        const userData =  JSON.parse(getUserInfo());
        console.log("userData", userData);
        if(userData != null){
            setUser({...user, usernameOrEmail:userData.username });
        }
    }, []);
    const signupHandler = useCallback(async(e)=>{
        const {usernameOrEmail} = user;
        e.preventDefault();
        // const token = "daf66e01593f61a.15b857cf433aae03a005812b31234e1490.36bcc8dee755dbb";
        const response = await callPOST("/api/auth/login",user, { "Content-Type": "application/json"});
        // const response = await fetch("http://localhost:8080/api/auth/login", {
        //     method: "POST", // or 'PUT'
        //     headers: {
        //     // "Authorization": `Bearer ${token}`,
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(user),
        //   });
       
          if(response?.status == 200){
            const { accessToken } = response.data;
            console.log("usernameOrEmail", usernameOrEmail, "\n user", user);
            props.succMessage("Loged in successfully");
           localStorage.setItem('access_token', accessToken);
           const userResponse = await callGET(`/notes/user/${usernameOrEmail}`);
           setUserInfo(userResponse.data);

            props.navigate("/notes");
        }else{
            props.failMessage("Invalid user name or password");

        }
    }, [user]);

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
            <h2>Log In</h2>
            <input type="text" placeholder="Email" name="usernameOrEmail" value={user.usernameOrEmail} />
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
           <input type="submit" value="Log In" onClick={(e) => signupHandler(e)} />
            <div className="links">
            <a href="#" onClick={()=> props.navigate("/notes")}>Back</a>
            </div>
        </form>    )
}
const mapDispatchToProps = {
    succMessage,
    failMessage, // This makes the someAction function available as this.props.someAction
  };
export default connect(null, mapDispatchToProps)(WithNavigation(LogInContainer));