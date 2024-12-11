import React from 'react';
import { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import style from "./Sidebar.module.scss";



const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

 
  const styles = {
    link: {
      textDecoration: 'none',
      padding: '10px 15px',
      color: '#000',  
    },
    accordionHeader: {
      fontWeight: 'bold', 
    },
  };
  
  const role = localStorage.getItem('role'); 

  
  const availableFieldLink = role === 'player' ? '/player-page' : '/field-owner-dashboard';

  return (
    <nav className="nav flex-column">
      <a className="btn" href={availableFieldLink} style={styles.link}>
        Available Field
      </a>
      <a className="btn" style={styles.link}>Open Match</a>
      <hr />
      <a className="btn" href="Personal">Personal</a>
      <a className="btn" onClick={() => setIsOpen(!isOpen)}>
        History
      </a>
      <Collapse in={isOpen}>
        <div>
          <div className="nav flex-column">
            <a className="btn" href="History_FieldBooked">Field booked</a>
            <a className="btn" href="History_Matchjoined">Match joined</a>
          </div>
        </div>
      </Collapse>
      <a className="btn" href='/field-owner-dashboard'>Field managerment</a>
    </nav>
  );
};

export default Sidebar;