import React, { Component } from "react";
import { WithNavigation } from "../../BasicComponents/WithNavigation";
import { Client } from "@stomp/stompjs";
import { SOCKET_URL } from "../../Globals/Constants";
import SockJS from "sockjs-client/dist/sockjs";
import { over } from "stompjs";
import { downloadFile, formatFileSize, generateRandomPassword, generateRandomUserName, getCompleteFile } from "../../Globals/UtilityFunctions";
import { connect } from "react-redux";
import { succMessage, failMessage, loaderAction } from "../../actions/MessagesAction";
// import { connectSocket } from "./WebRTC";

let stompClient = null;
let peerConnection = null;
// let receiveFileChunks = [];
// let receiveFileName;
class FileShareContainer extends Component {

  state = {
    files: [],
    messages: 'You server message here.',
    candidate: {},
    receiveKey: '',
    userName: '',
    didIOffer: false,
    receiveFileName: '',
    receiveFileChunks: [],
    tempPassword: '',
    send: false,
  }

  componentDidMount = () => {
    this.connect();
    const uName = generateRandomUserName(6);
    this.setState({ userName: uName });
  }
  componentDidCatch = (error, info) => {

    // console.log("eror", error,"\n info", info);
  }

  componentWillUnmount =()=>{
    stompClient.send('/app/removeUser', {}, this.state.userName);
  }
  fileChangeHandler = (e) => {
    // this.props.loaderAction(true);
    if (Object.values(e.target.files).length > 5) {
      e.target.value = null;
      this.props.failMessage("Maxmum file count is 5");
      return false;

    }
    
    this.setState({ files: Object.values(e.target.files) });
  }

  sendFile = () => {
    // connectSocket();
    this.connect1()
  }
  connect1 = async () => {

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
        "userName": this.state.userName,
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

  connect = () => {
    let Sock = new SockJS('http://localhost:8080/ws');
    // console.log("sock", Sock);
    stompClient = over(Sock);
    stompClient.connect({}, this.onConnected, this.onError);
  }

  onConnected = () => {
    const newClient = {
      "userName": this.state.userName,
    }
    stompClient.send("/app/new-client", {}, JSON.stringify(newClient));
    stompClient.subscribe('/user/' + this.state.userName + '/message', (response) => {
      const iceCandidate = JSON.parse(response.body);
      console.log("Received ICE candidate:", iceCandidate);
      this.answerOffer(iceCandidate);
    });
    stompClient.subscribe(`/user/${this.state.userName}/receivedIceCandidateFromServer`, (response) => {
      const iceCandidate = JSON.parse(response.body);
      console.log(" Received ICE candidate: receivedIceCandidateFromServer", iceCandidate);
      this.addNewIceCandidate(iceCandidate);
    })

    stompClient.subscribe(`/user/${this.state.userName}/answerResponse`, this.addAnswer)

  }
  addNewIceCandidate = (iceCandidate) => {
    peerConnection.addIceCandidate(iceCandidate)
    console.log("======Added Ice Candidate======")
  }
  onError = () => {
    // alert("ERROR")
  }
  onMessageReceived1 = (event) => {
    let receivedBuffer = [];
    let totalBytesFileBuffer = 0;
    let totalBytesArrayBuffers = 0;
    const { data } = event;

    try {
      if (data.byteLength) {
        receivedBuffer.push(data);
        // totalBytesArrayBuffers += data.byteLength;

        // if (totalBytesFileBuffer > 0) {
        //   this.setState({
        //     progressTransferFile:
        //       (totalBytesArrayBuffers * 100) / totalBytesFileBuffer,
        //   });
        // }
      } else if (data.toString() == 'EOF') {
        const fileName = 'hi.jpeg';
        console.log("fileName", fileName);
        getCompleteFile(
          receivedBuffer,
          totalBytesArrayBuffers,
          fileName
        );
        channel.close();

        receivedBuffer = [];
        totalBytesFileBuffer = 0;
        totalBytesArrayBuffers = 0;
      } else {
        const initMessage = JSON.parse(data);
        totalBytesFileBuffer = initMessage.totalByte || 0;
      }
    } catch (err) {
      receivedBuffer = [];
      totalBytesFileBuffer = 0;
      totalBytesArrayBuffers = 0;
    }

  }
  onMessageReceived = (event) => {
    this.props.loaderAction(true);
    try {

      const data = event.data;
      console.log("dataChannel===========>", data);
      if (data.byteLength) {
        this.setState(prevState => ({ receiveFileChunks: [...prevState.receiveFileChunks, data] }));
        // receiveFileChunks.push(data); 
      } else if (data.toString() === 'EOF') {
        // Once all the chunks are received, combine them to form a Blob
        const { receiveFileChunks, receiveFileName } = this.state;
        const file = new Blob(receiveFileChunks);
        downloadFile(file, receiveFileName)
        this.setState({ receiveFileChunks: [], receiveFileName: '' });
      } else {
        const initMessage = JSON.parse(data);
        console.log("initMessage", initMessage);
        this.setState({ receiveFileName: initMessage.fileName });
      }
    } catch (e) {
      console.error(e);
    }finally{
      this.props.loaderAction(false);
    }

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

  render() {
    const { tempPassword, send, files } = this.state;
    return (
      <div>
        <div className="container-main p-4">
          <div className="form-box">
            {
              (!send && files.length === 0) ?

              <div class="upload-container">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"></path>
              </svg>
              <input type="file" className="file-upload" accept=".jpg, .jpeg, .png, .pdf" multiple={5} onChange={(e) => this.fileChangeHandler(e)} />
              <h3>Add files to send</h3>
            </div>


                : (!send && files.length > 0) ?
                  <>
                  <div className="file-container">
                    {
                      files.map((item, index)=>(
                      <div className="item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.25" width="24" height="24"><defs></defs><polyline className="cls-637647fac3a86d32eae6f23f-1" points="7.23 16.77 11.04 12.96 12.96 14.86 16.77 11.04"></polyline><polygon className="cls-637647fac3a86d32eae6f23f-1" points="20.59 6.27 20.59 22.5 3.41 22.5 3.41 1.5 15.82 1.5 20.59 6.27"></polygon><polygon class="cls-637647fac3a86d32eae6f23f-1" points="20.59 6.27 20.59 7.23 14.86 7.23 14.86 1.5 15.82 1.5 20.59 6.27"></polygon></svg>
                      <div className="filename">
                        <p>{item.name}</p>
                        <div className="filedata">
                          <span>{item.type}</span>
                          <span>●</span>
                          <span>{formatFileSize(item.size)}</span>
                        </div>
                      </div>
                      <button onClick={this.fileRemoveHandler.bind(this, item)}>Remove</button>
                      </div>
                      ))
                    }
                    
                   </div>
                    <button onClick={this.sendFile.bind(this)} style={{ width: '100%' }}>Send</button>
                 
                  </>
                  :
                  <>
                    <h4>Enter the 6-digit key on the receiving device</h4>
                    <h4 id="timer">  </h4>
                    <h4>{tempPassword}</h4>
                  </>
            }

          </div>
          <div className="form-box1">
            <h4>Receive</h4>
            <input className="form-control" type="text"
              onChange={(e) =>{ e.stopPropagation(); this.setState((prevState) => ({ receiveKey: e.target.value }))}}
              onKeyDown={(e) => {
                e.stopPropagation(); 
                if (e.key === 'Enter') {
                  e.preventDefault();
                  this.receiveHandler();
                }
              }} />
          </div>
        </div>
      </div>
    )
  }

  fileRemoveHandler = (file)=>{

    const {files} = this.state;

    let updatedFiles = files;
    updatedFiles = updatedFiles.filter(itm => itm.name != file.name);

    this.setState({files: updatedFiles});
  }
  receiveHandler = async () => {

    await stompClient.send('/app/get-candidate', {}, JSON.stringify({ "userName": this.state.userName, "password": this.state.receiveKey }));

  }
  answerOffer = async (offerObj) => {
    await this.createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer({}); //just to make the docs happy
    await peerConnection.setLocalDescription(answer); //this is CLIENT2, and CLIENT2 uses the answer as the localDesc
    console.log("offerObj", offerObj)
    console.log("answer", answer)
    // console.log(peerConnection.signalingState) //should be have-local-pranswer because CLIENT2 has set its local desc to it's answer (but it won't be)
    //add the answer to the offerObj so the server knows which offer this is related to
    offerObj.answer = answer;
    offerObj.answererUserName = this.state.userName;

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

  addAnswer = async (offerObj) => {
    //addAnswer is called in socketListeners when an answerResponse is emitted.
    //at this point, the offer and answer have been exchanged!
    //now CLIENT1 needs to set the remote
    const iceCandidate = JSON.parse(offerObj.body);
    console.log("addAnswer", iceCandidate);
    await peerConnection.setRemoteDescription(iceCandidate)
    // console.log(peerConnection.signalingState)
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
        if (this.state.files.length > 0) {
          try {
            for (let key = 0; key < this.state.files.length; key++) {
              let buffer;
              let file = this.state.files[key];
              console.log("file", file, "\n key", key);

              buffer = await file.arrayBuffer();
              const totalBytes = buffer.byteLength;
              dataChannel.send(JSON.stringify({
                fileName: file.name
              }))
              let sentBytes = 0;
              const chunkSize = 16 * 1024;
              while (buffer.byteLength) {
                const chunk = buffer.slice(0, chunkSize);
                buffer = buffer.slice(chunkSize, buffer.byteLength);

                dataChannel.send(chunk);
                sentBytes += chunk.byteLength;

                // Update progress (replace with your UI update logic)
                // const progress = Math.floor((sentBytes / totalBytes) * 100);
                // this.updateProgress(progress);
              }
              dataChannel.send(`EOF`);


            }
          } catch (error) {
            console.error("Error sending file:", error);
            // Handle error (e.g., display error message to user)
          } finally {

            this.setState({ tempPassword: '', send: false })
          }
        }
      });
      console.log("this.state.files.length", this.state.files.length);
      //  console.log('dataChannel.sen', `EOF-${this.state.files[0].name}`);

      dataChannel.addEventListener('error', this.onDataError);

      dataChannel.addEventListener('message', this.onMessageReceived);

      peerConnection.addEventListener("signalingstatechange", (event) => {
        console.log(event);
        console.log(peerConnection.signalingState)
      });

      peerConnection.addEventListener('icecandidate', async e => {


        if (e.candidate) {
          const { userName, didIOffer } = this.state
          const iceCandidate = {
            "iceCandidate": e.candidate,
            "userName": userName,
            "didIOffer": didIOffer,
          }
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

  onDataError = (event) => { console.log("evevt", event); };
}
const mapDispatchToProps = {
  succMessage,
  failMessage,
  loaderAction // This makes the someAction function available as this.props.someAction
};
export default connect(null, mapDispatchToProps)(WithNavigation(FileShareContainer));