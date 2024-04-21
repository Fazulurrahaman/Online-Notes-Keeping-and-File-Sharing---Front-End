import React, { Component } from "react";
import { connect } from "react-redux";
import { succMessage, failMessage, loaderAction } from "../../actions/MessagesAction"
import Messages from "../../BasicComponents/Messages";
import NoRecordSkeleton from "../../BasicComponents/NoRecordSkeleton";
import { WithNavigation } from "../../BasicComponents/WithNavigation";
import { debounce, downloadFile, generateRandomPassword, getText, getToken, getUserInfo, removeUserSession } from "../../Globals/UtilityFunctions";
import { callDELETE, callGET, callPatch } from "../../Globals/ApiUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faFileDownload, faHeartCircleMinus, faHeartCirclePlus, faRightToBracket, faShare, faShareNodes, faTrash } from "@fortawesome/free-solid-svg-icons";
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
import { jsPDF } from "jspdf";
import { NoteShareModal } from "./NoteShareModal";
import SockJS from "sockjs-client/dist/sockjs";
import { over } from "stompjs";

let stompClient = null;
let peerConnection = null;

class NotesContainer extends Component {

    state = {
        isOpenEditor: false,
        tableRecords: {
            tableData: [],
            searchKey: "",
        },
        user: {},
        isShare: false,
        sharingNote:{},
        didIOffer: false,
        tempPassword: '',
        send: false,
    }

    componentDidMount = async () => {
        const user = JSON.parse(getUserInfo());
        if (user?.id) {
            this.setState({ user: user }, () => { this.setTableData(); });

        }
    }

    componentWillUnmount = () =>{
      if(stompClient != null){
      stompClient.send('/app/removeUser', {}, this.state.user.username);
      stompClient.disconnect();
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
                                                                                    <FontAwesomeIcon icon={item.isFavourite ? faHeartCircleMinus : faHeartCirclePlus} title={`${item.isFavourite ? 'Remove from favourite' : 'Add to favourite'}`} onClick={(e)=>{e.stopPropagation(); this.addOrRemoveFavourite(item);}}/>
                                                                                    <span> | </span> 
                                                                                    <FontAwesomeIcon icon={faTrash} title="Delete" onClick={(e) => { e.stopPropagation(); this.deleteHanlder(item.id); }} />
                                                                                    <span> | </span>
                                                                                    <FontAwesomeIcon icon={faDownload} title="Download as PDF" onClick={(e)=>{e.stopPropagation(); this.downloadPDFHandler(item);}}/>
                                                                                    <span> | </span>
                                                                                    <FontAwesomeIcon icon={faShareNodes} title="Share" onClick={(e)=>{e.stopPropagation(); this.noteShareHandler(item);}}/>
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

{
                (this.state.isShare) ?
                    <NoteShareModal
                    show={this.state.isShare}
                    title = {this.state.sharingNote.title}
                    closeHandler= {this.toggleShare}
                    tempPassword={this.state.tempPassword}
                    />
                    :
                    <></>
            }
            </>
        )
    }

    addOrRemoveFavourite = (note) =>{
     
      const payload ={
        ...note,
        isFavourite: !note.isFavourite
      }
      this.props.loaderAction(true);
      console.log("note", payload);
      callPatch('/notes/favourite', payload)
      .then(response =>{
        if (response.status == 200) {
          const responseData = response.data;
          if (responseData.code === 200) {
            if(payload.isFavourite){
              this.props.succMessage("Note added as favourite");
            }else{
              this.props.succMessage("Note removed from favourite");
            }
            this.setTableData();
          }else{
            this.props.failMessage(responseData.message);

          }
        }
      }).catch(e => this.props.failMessage(e.message))
      .finally(()=> this.props.loaderAction(false))
    }
    startTimer = (minutes, seconds) => {
      const timerElement = document.getElementById('timer');
      if (timerElement == null) {
        return;
      }
      if (minutes === 0 && seconds === 0) {
        timerElement.textContent = "Timer completed!";
        this.setState({ send: false });
        return;
      }
  
      timerElement.textContent = `Expires in ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
      if (seconds === 0) {
        setTimeout(() => this.startTimer(minutes - 1, 59), 1000);
      } else {
        setTimeout(() => this.startTimer(minutes, seconds - 1), 1000);
      }
    }
    toggleShare =(note={})=>{
      if(this.state.isShare){
        stompClient.send('/app/removeUser', {}, this.state.user.username);
        stompClient.disconnect();
      }
        this.setState(prevState =>({isShare: !prevState.isShare, sharingNote: note}));
    }
    noteShareHandler=(note)=>{
      console.log(this.state.user);
    //  return false;
        this.toggleShare(note);
        this.connect();

    }
    connect1 = async () => {
        const {username} = this.state.user;
        await this.createPeerConnection();
    
        try {
          console.log("Creating offer...", peerConnection);
          // Check if the connection is established before creating an offer
          if (peerConnection.connectionState !== "connected") {
            console.log("Connection not established yet. Waiting...");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
          }
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          this.setState({ didIOffer: true });
          const pass = generateRandomPassword();
          console.log("offer", offer);
          this.setState({ tempPassword: pass, send: true }, () => { this.startTimer(9, 95); });
          const payload = {
            "userName": username,
            "offer": offer,
            "password": pass,
            //     "iceCandidate": this.state.candidate,
            //     "userName": this.state.userName
          };
          stompClient.send('/app/offer', {}, JSON.stringify(payload)); // Send offer to signaling server
    
        } catch (err) {
          console.log(err);
        }
      }

      createPeerConnection = async (offerObj) => {
        let peerConfiguration = {
          iceServers: [
            {
              urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302'
              ]
            }
          ]
        }
        return new Promise(async (resolve, reject) => {
          //RTCPeerConnection is the thing that creates the connection
          //we can pass a config object, and that config object can contain stun servers
          //which will fetch us ICE candidates
          peerConnection = await new RTCPeerConnection(peerConfiguration)
          // remoteStream = new MediaStream()
          // remoteVideoEl.srcObject = remoteStream;
    
          const dataChannel = peerConnection.createDataChannel('file', { negotiated: true, id: 0 });
          const MAXIMUM_SIZE_DATA_TO_SEND = 65535;
    
          // Handle data channel events
          dataChannel.addEventListener('open', async () => {
            const { title, content } = this.state.sharingNote;
            let buffer;
            try {
                // Convert the string content to a Uint8Array
                const encoder = new TextEncoder();
                const uint8Array = encoder.encode(content);
                buffer = uint8Array.buffer;
                dataChannel.send(JSON.stringify({
                    fileName: `${title}.pdf`
                }));
                const totalBytes = buffer.byteLength;
                let sentBytes = 0;
                const chunkSize = 16 * 1024;
                console.log("sharingNte", uint8Array);

                while (buffer.byteLength > 0) {
                    const chunk = buffer.slice(0, Math.min(chunkSize, buffer.byteLength));
                    buffer = buffer.slice(chunkSize);
                    dataChannel.send(chunk);
                    sentBytes += chunk.byteLength;
                }
                dataChannel.send(`EOF-STR`);
            } catch (error) {
                console.error("Error sending file:", error);
                // Handle error (e.g., display error message to user)
            } finally {
                this.setState({ tempPassword: '', send: false });
            }
        });
        
        
        
          //  console.log('dataChannel.sen', `EOF-${this.state.files[0].name}`);
    
          dataChannel.addEventListener('error', this.onError);
    
    
          peerConnection.addEventListener("signalingstatechange", (event) => {
            console.log(event);
            console.log(peerConnection.signalingState)
          });
    
          peerConnection.addEventListener('icecandidate', async e => {
    
    
            if (e.candidate) {
              const { didIOffer } = this.state;
              const { username } = this.state.user;
              const iceCandidate = {
                "iceCandidate": e.candidate,
                "userName": username,
                "didIOffer": didIOffer,
              }
              console.log("sender iceCandidate", iceCandidate);
              await stompClient.send("/app/sendIceCandidateToSignalingServer", {}, JSON.stringify(iceCandidate));
              // socket.emit('sendIceCandidateToSignalingServer',{
              //     iceCandidate: e.candidate,
              //     iceUserName: userName,
              //     didIOffer,
              // })    
            }
          })
    
          peerConnection.addEventListener('track', e => {
            console.log("Got a track from the other peer!! How excting")
            console.log('track', e)
            // e.streams[0].getTracks().forEach(track=>{
            //     remoteStream.addTrack(track,remoteStream);
            //     console.log("Here's an exciting moment... fingers cross")
            // })
          })
    
          if (offerObj) {
    
    
            //this won't be set when called from call();
            //will be set when we call from answerOffer()
            // console.log(peerConnection.signalingState) //should be stable because no setDesc has been run yet
            await peerConnection.setRemoteDescription(offerObj.offer);
            // console.log(peerConnection.signalingState) //should be have-remote-offer, because client2 has setRemoteDesc on the offer
          }
          resolve();
        })
      }
    
    connect = () => {
        let Sock = new SockJS('http://localhost:8080/ws');
        // console.log("sock", Sock);
        stompClient = over(Sock);
        stompClient.connect({}, this.onConnected, this.onError);
      }

      onConnected = () => {
        const {username} = this.state.user;
        const newClient = {
          "userName": username,
        }
        stompClient.send("/app/new-client", {}, JSON.stringify(newClient));
        stompClient.subscribe('/user/' + username + '/message', (response) => {
          const iceCandidate = JSON.parse(response.body);
          console.log("Received ICE candidate:", iceCandidate);
          this.answerOffer(iceCandidate);
        });
        stompClient.subscribe(`/user/${username}/receivedIceCandidateFromServer`, (response) => {
          const iceCandidate = JSON.parse(response.body);
          console.log(" Received ICE candidate: receivedIceCandidateFromServer", iceCandidate);
          this.addNewIceCandidate(iceCandidate);
        })
    
        stompClient.subscribe(`/user/${username}/answerResponse`, this.addAnswer)

        this.connect1();

    
      }
      addAnswer = async (offerObj) => {
        //addAnswer is called in socketListeners when an answerResponse is emitted.
        //at this point, the offer and answer have been exchanged!
        //now CLIENT1 needs to set the remote
        const iceCandidate = JSON.parse(offerObj.body);
        console.log("addAnswer", iceCandidate);
        await peerConnection.setRemoteDescription(iceCandidate)
        // console.log(peerConnection.signalingState)
      }
      answerOffer = async (offerObj) => {
        const {username} = this.state.user;
        await this.createPeerConnection(offerObj);
        const answer = await peerConnection.createAnswer({}); //just to make the docs happy
        await peerConnection.setLocalDescription(answer); //this is CLIENT2, and CLIENT2 uses the answer as the localDesc
        console.log("offerObj", offerObj)
        console.log("answer", answer)
        // console.log(peerConnection.signalingState) //should be have-local-pranswer because CLIENT2 has set its local desc to it's answer (but it won't be)
        //add the answer to the offerObj so the server knows which offer this is related to
        offerObj.answer = answer;
        offerObj.answererUserName = username;
    
        //emit the answer to the signaling server, so it can emit to CLIENT1
        //expect a response from the server with the already existing ICE candidates
        await stompClient.send('/app/newAnswer', {}, JSON.stringify(offerObj));
        peerConnection.addIceCandidate(offerObj.iceCandidate);
    
        // peerConnection.setRemoteDescription(new RTCSessionDescription())
        // const offerIceCandidates = await socket.emitWithAck('newAnswer',offerObj)
        // offerIceCandidates.forEach(c=>{
        //     peerConnection.addIceCandidate(c);
        //     console.log("======Added Ice Candidate======")
        // })
        // console.log(offerIceCandidates)
      }

      addNewIceCandidate = (iceCandidate) => {
        peerConnection.addIceCandidate(iceCandidate)
        console.log("======Added Ice Candidate======")
      }

      onError =()=>{

      }
    downloadPDFHandler = (note) => {

        this.props.loaderAction(true);
        try{
            let doc = new jsPDF('p', 'pt', 'a4');
        
            doc.html(`<div style="width:1350px">${note.content}</div>`, {
                callback: function (doc) {
                    doc.save(`${note.title}.pdf`);
                },
                html2canvas: { scale: 0.5 }
            });
        }catch(e){
            console.error(e);
        }finally{
            this.props.loaderAction(false);
        }
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