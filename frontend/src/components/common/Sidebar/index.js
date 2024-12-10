import React from 'react';
import Accordion from 'react-bootstrap/Accordion';

const Sidebar = () => {
 
  const styles = {
    link: {
      fontWeight: 'bold',  
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
    <nav className="nav flex-column bg-light">
      <a className="btn" href={availableFieldLink} style={styles.link}>
        Available Field
      </a>
      <a className="btn" style={styles.link}>Open Match</a>

      <hr />

      <a className="btn" href="Personal" style={styles.link}>Personal</a>

      <Accordion defaultActiveKey="0" flush>
        <Accordion.Item>
          <Accordion.Header>
            <div className="d-flex justify-content-center w-100">
              <p style={styles.accordionHeader}>History</p>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="nav flex-column">
              <a className="btn" href="History_FieldBooked" style={styles.link}>Field booked</a>
              <a className="btn" href="History_Matchjoined" style={styles.link}>Match joined</a>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <a className="btn" href='/field-owner-dashboard' style={styles.link}>Field management</a>
    </nav>
  );
};

export default Sidebar;