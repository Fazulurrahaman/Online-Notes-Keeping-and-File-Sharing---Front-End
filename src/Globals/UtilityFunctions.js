function generateRandomPassword() {
    // Generate a random number between 100000 and 999999 (inclusive)
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    
    // Convert the random number to a string
    const password = randomNum.toString();
    
    return password;
}

function generateRandomUserName(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let userName = '';
    for (let i = 0; i < length; i++) {
        userName += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return userName;
}

 const getCompleteFile = (
    receivedArrayBuffers,
    totalBytesArrayBuffers,
    fileName
   ) => {
    let offset = 0;
    const uintArrayBuffer = new Uint8Array(totalBytesArrayBuffers, 0);
    
    receivedArrayBuffers.forEach((arrayBuffer) => {
      uintArrayBuffer.set(
        new Uint8Array(arrayBuffer.buffer || arrayBuffer, arrayBuffer.byteOffset),
        offset
      );
      offset += arrayBuffer.byteLength;
    });
    
    const blobObject = new Blob([uintArrayBuffer]);
    
    return downloadFile(blobObject, fileName);
   };

   const downloadFile = (blob, fileName) => {
    // Create a temporary anchor element
    const a = document.createElement('a');
    document.body.appendChild(a);
  
    // Set the href attribute of the anchor to the Blob object
    a.href = window.URL.createObjectURL(blob);
  
    // Set the download attribute to specify the file name
    a.download = fileName;
  
    // Trigger a click event on the anchor to start the download
    a.click();
  
    // Clean up by removing the temporary anchor element
    document.body.removeChild(a);
    
    // Revoke the Blob object URL to free up resources
    window.URL.revokeObjectURL(a.href);
  };
  
 const getToken = () => {
    return localStorage.getItem('access_token') || null;
  }
  function isValidEmail(email) {
    // Regular expression for validating an email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
const setUserInfo=(data)=>{
  console.log("setUserInfo", data);
  localStorage.setItem("userInfo", JSON.stringify(data));
}
const getUserInfo =()=>{
  return localStorage.getItem('userInfo') || null;
}

const removeUserSession =()=>{
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_info');
}

const removeAccessToken=()=>{
  localStorage.removeItem('access_token');

}
function getText(html){
  var divContainer= document.createElement("div");
  divContainer.innerHTML = html;
  return divContainer.textContent.substring(0, 100) || divContainer.innerText.substring(0, 100) || "";
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
      return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}

function debounce(func, delay) {
  let timeoutId;
  
  return function() {
      const context = this;
      const args = arguments;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
          func.apply(context, args);
      }, delay);
  };
}
export {debounce, formatFileSize,getText, removeAccessToken, removeUserSession, setUserInfo, getUserInfo, generateRandomPassword, generateRandomUserName, getCompleteFile, downloadFile, getToken, isValidEmail};