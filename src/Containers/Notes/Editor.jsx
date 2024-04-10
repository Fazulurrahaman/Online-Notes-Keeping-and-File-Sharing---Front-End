import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { callGET, callPOST } from "../../Globals/ApiUtils";
import { getUserInfo, removeUserSession } from "../../Globals/UtilityFunctions";
import { connect } from "react-redux";
import { WithNavigation } from "../../BasicComponents/WithNavigation";
import {succMessage, failMessage} from "../../actions/MessagesAction"
import Breadcrumbs from "../../BasicComponents/BreadCrumbs";

const Editor = (props) => {
  const [editorHtml, setEditorHtml] = useState(props.value);
    const[userData, setUserData] = useState({});
    const [title, setTitle] = useState('');

    useEffect(()=>{
        const user = JSON.parse(getUserInfo());
        setUserData(user);
        const param =  props.params;
        if(param.id){
          fetchNoteDetails(param.id);
        }
        console.log("param", props.params);
    }, []);

    const fetchNoteDetails =(id)=>{
      callGET(`/notes/${id}`)
      .then(response =>{
        if(response.status == 200){
          const responseData = response.data;
          if(responseData.code == 200){
            console.log("response.data", responseData.data);
            const data = responseData.data;
            setTitle(data.title);
            setEditorHtml(data.content);
          }
        }
      })
    }
  const handleChange = (html) => {
    setEditorHtml(html);
    console.log("html", html);
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
 

    // try {
    //   const response = await axios.post("http://your-api/upload-image", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   });
    //   const imageUrl = response.data.imageUrl;
    //   return imageUrl;
    // } catch (error) {
    //   console.error("Error uploading image:", error);
    //   return "";
    // }
  };

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", "image", "video"],
      ["clean"]
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video"
  ];

  const saveHandler = ()=>{
    // removeUserSession();
    const param =  props.params;
    const payload ={
        title: title,
        content: editorHtml,
        userId: userData.id,
        ...(param.id && { id: param.id })
    }
console.log("payload", payload, "\n userData", userData);
    // return false;
    callPOST("/notes/create", payload)
    .then((response)=>{
        console.log("response ---", response);
      if(response.status == 200){
        const responseData = response.data;
        if(responseData.code == 201){
          props.succMessage(responseData.message);
        }else{
          props.failMessage(responseData.message);
        }
      }
    }).catch((e)=>{
        console.log("error", e);
    })
  }
  const handleSave = () => {
    console.log('Save clicked');
    // Add your save logic here
  };
  const breadcrumbs = [
    { text: 'Notes', link: '/notes' },
   
  ];
  return (
    <div>
   
      <Breadcrumbs crumbs={breadcrumbs} onSave={saveHandler}/> 
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title"className="title-input"/> 
      <ReactQuill
        theme="snow"
        onChange={handleChange}
        value={editorHtml}
        modules={{ toolbar: modules.toolbar, clipboard: modules.clipboard }}
        formats={formats}
        bounds={".app"}
        placeholder={props.placeholder}
        imageHandler={handleImageUpload}
      />
    </div>
  );
};

Editor.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string
};

Editor.defaultProps = {
  placeholder: "",
  value: ""
};

const mapDispatchToProps = {
  succMessage,
  failMessage, // This makes the someAction function available as this.props.someAction
};
export default connect(null, mapDispatchToProps)(WithNavigation(Editor));
