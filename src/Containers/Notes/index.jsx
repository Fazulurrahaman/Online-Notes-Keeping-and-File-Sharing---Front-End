import React, { Component } from "react";
import { connect } from "react-redux";
import { succMessage, failMessage, loaderAction } from "../../actions/MessagesAction"
import Messages from "../../BasicComponents/Messages";
import NoRecordSkeleton from "../../BasicComponents/NoRecordSkeleton";
import { WithNavigation } from "../../BasicComponents/WithNavigation";
import { debounce, downloadFile, getText, getToken, getUserInfo, removeUserSession } from "../../Globals/UtilityFunctions";
import { callDELETE, callGET } from "../../Globals/ApiUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFileDownload, faRightToBracket, faShare, faShareNodes, faTrash } from "@fortawesome/free-solid-svg-icons";
import boatImage from '../../assets/img/boat-8614314_1280.webp';
import flowersImage from '../../assets/img/flowers-19830_1280.jpg';
import mountainsImage1 from '../../assets/img/mountains-1587287_1280.jpg';
import mountainsImage2 from '../../assets/img/mountains-190055_1280.jpg';
import natureImage1 from '../../assets/img/nature-3082832_1280.jpg';
import natureImage2 from '../../assets/img/nature-8622415_1280.webp';
import oceanImage from '../../assets/img/ocean-3605547_1280.jpg';
import sunriseImage from '../../assets/img/sunrise-1014712_1280.jpg';
import thunderstormImage from '../../assets/img/thunderstorm-3625405_1280.jpg';
import noRecord from "../../assets/img/no-record.png";


class NotesContainer extends Component {

    state = {
        isOpenEditor: false,
        tableRecords: {
            tableData: [],
            searchKey: "",
        },
        user: {}
    }

    componentDidMount = async () => {
        const user = JSON.parse(getUserInfo());
        if (user?.id) {
            this.setState({ user: user }, () => { this.setTableData(); });

        }
    }

    setTableData = async (searchKey = null) => {
        this.props.loaderAction(true);
        const user = this.state.user;
        try{
            const response = await callGET(`/notes/getAll/${user.id}/${searchKey === '' ? null : searchKey}`);
            if (response.status == 200) {
                const responseData = response.data;
                if (responseData.code === 200) {
                    //    const data = responseData.data.map((element, index) => {
                    console.log("componentDidMount", responseData.data);
    
                    //     });
                    this.setState({ tableRecords: { tableData: responseData.data, searchKey: searchKey } })
                } else {
                    this.props.failMessage(responseData.messages);
                }
            }
        }catch(e){
            console.error(e);
        }finally{
            this.props.loaderAction(false);
        }
       
    }
    render() {
        const { tableData, searchKey } = this.state.tableRecords;
        const token = getToken();
        let isAuthenticated = false;
        if (token != null) {
            isAuthenticated = true;
        }
        return (
            <>
                {
                    (isAuthenticated) ?
                        (tableData.length === 0 && searchKey.length === 0) ? (
                            <>
                                {/* <NoRecordSkeleton/> */}
                                <div className="center">
                                    <button className="add-new" onClick={() => { this.setState({ isOpenEditor: true }); this.props.navigate("/addNote") }} >+ Add New</button>
                                    <span style={{ margin: '0 10px' }}></span>
                                    <button className="add-new" onClick={() => { removeUserSession(); this.props.navigate("/notes") }} >Log Out</button>
                                </div>
                            </>
                        ) : (

                            <>
                                <div className="search-container">
                                    <input type="text" placeholder="Search..." className="form-control" onChange={(e) => debounce(()=>this.setTableData((e.target.value)), 300)()} />
                                </div>
                                {
                                    (tableData.length === 0 && searchKey.length > 0)?
                                            <>
                                                <div className="img-container">
                                                    <div className="round-image">
                                                        <img src={noRecord} alt="" />
                                                    </div>
                                                    <h3>No Record Found!</h3>
                                                </div>

                                           
                                                </>
                                            :
                                            <>
                                    <button id="floatingRectangle" onClick={() => this.props.navigate("/addNote")}> + Add New </button>
                                <div id="cards_landscape_wrap-2">
                                    <div class="container">
                                        <div class="row">
                                            {

                                                tableData.map((item, index) => {
                                                    const parsedHtml = getText(item.content);
                                                    const imgUrl = this.randomImage();
                                                    return (
                                                        <>
                                                          <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 " key={index}>
                                                                <a onClick={(e) => { e.stopPropagation(); this.editHandler(item) }}>
                                                                    <div class="card-flyer cursor-pointer">
                                                                        <div class="text-box">
                                                                            <div class="image-box">
                                                                                <img src={imgUrl} alt="" />
                                                                            </div>
                                                                            <div className="text-container">
                                                                                <h6>{item.title}</h6>
                                                                                <p>{parsedHtml}</p>
                                                                                <p className="meta">
                                                                                    {/* <time className="updated" itemProp="datePublished">{item.updatedAt}</time>
                                                                                    <span> | </span> */}
                                                                                    <FontAwesomeIcon icon={faTrash} title="Delete" onClick={(e) => { e.stopPropagation(); this.deleteHanlder(item.id); }} />
                                                                                    <span> | </span>
                                                                                    <FontAwesomeIcon icon={faDownload} title="Download as PDF" onClick={(e)=>{e.stopPropagation(); this.downloadPDFHandler(item);}}/>
                                                                                    <span> | </span>
                                                                                    <FontAwesomeIcon icon={faShareNodes} title="Share"/>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            </div>

                                                        </>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                                </>
                                }
                                

                            </>
                        )
                        : (
                            <>
                                {/* <NoRecordSkeleton/> */}
                                <div className="center">
                                    <button className="add-new" onClick={() => this.props.navigate("/signup")}>Sign Up</button>
                                    <span style={{ margin: '0 10px' }}></span>
                                    <button className="add-new" onClick={() => this.props.navigate("/login")}>Log In</button>
                                </div>
                            </>
                        )
                }


            </>
        )
    }

    downloadPDFHandler = (note) => {

        // const pdf = new jsPDF();
        let 
        // callGET(`/notes/download/${note.id}`)
        // .then((response) => {
        //     console.log("response", response);
        //     // const binaryString = atob(response.data);
        //     const bytes = new Uint8Array(response.data.length);
        //     for (let i = 0; i < bytes.length; i++) {
        //       bytes[i] = response.data.charCodeAt(i);
        //     }

        // // Create a Blob from the Uint8Array
        // const blob = new Blob([bytes.buffer], { type: 'application/pdf' });
        //     downloadFile(blob, `${note.title}.pdf`);
        // });

    }
    randomImage = () => {
        const images = [
            boatImage,
            flowersImage,
            mountainsImage1,
            mountainsImage2,
            natureImage1,
            natureImage2,
            oceanImage,
            sunriseImage,
            thunderstormImage,
        ];
        const randomImageUrl = images[Math.floor(Math.random() * images.length)];

        return randomImageUrl;
    }

    deleteHanlder = (id) => {
        if (window.confirm("Do you really want to delete this note?")) {
            callDELETE(`/notes/delete/${id}`)
                .then(response => {
                    if (response.status == 200) {
                        const responseData = response.data;
                        if (responseData.code === 200) {
                            this.props.succMessage(responseData.message);
                            this.setTableData();
                        } else {
                            this.props.failMessage(responseData.message);
                        }
                    }
                })
        }
    }
    editHandler = (item) => {
        console.log("item", item);
        this.props.navigate(`/addNote/${item.id}`)
    }
}
const mapDispatchToProps = {
    succMessage,
    failMessage, 
    loaderAction,// This makes the someAction function available as this.props.someAction
};
export default connect(null, mapDispatchToProps)(WithNavigation(NotesContainer));