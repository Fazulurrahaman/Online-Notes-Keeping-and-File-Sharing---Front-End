import { io } from "socket.io-client";

const connectSocket =()=>{

    const socket =io.connect("http://localhost:8080/share/hello");
    console.log(socket);
}

export {connectSocket};