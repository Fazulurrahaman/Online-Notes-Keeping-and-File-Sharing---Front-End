import React from "react";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export const NoteShareModal =(props)=>{
    const {show, title, closeHandler, tempPassword} = props;
    return(
        <Modal show={show} >
        <Modal.Header >
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Enter the 6-digit key on the receiving device</h4>
          <h4 id="timer">  </h4>
          <h4>{tempPassword}</h4>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeHandler}>
            Close
          </Button>
    
        </Modal.Footer>
      </Modal>
    )
};