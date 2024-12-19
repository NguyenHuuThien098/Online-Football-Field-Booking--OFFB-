import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import style from "./Sidebar.module.scss";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const styles = {
    link: {
      textDecoration: 'none',
      padding: '10px 15px',
      color: '#000',
    },
    activeLink: {
      textDecoration:  'none',
      padding: '10px 15px',
      color: '#000',
      backgroundColor: 'white',
      borderLeft: '20px solid #007bff',
      transition: 'all 0.3s ease',
    },
    accordionHeader: {
      fontWeight: 'bold', 
    },
  };

  const role = localStorage.getItem('userRole');
  const availableFieldLink = role === 'player' ? '/player-page' : '/field-owner-dashboard';

  return (
    <nav className="nav flex-column">
      <Link
        className="btn"
        to="/"
        style={location.pathname === '/' ? styles.activeLink : styles.link}
      >
        Available Field
      </Link>
      <Link
        className="btn"
        to="/openMatch"
        style={location.pathname === '/openMatch' ? styles.activeLink : styles.link}
      >
        Open Match
      </Link>
      <hr />
      <Link
        className="btn"
        to="/personal"
        style={location.pathname === '/personal' ? styles.activeLink : styles.link}
      >
        Personal
      </Link>
      <Link 
        className="btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={isOpen ? styles.activeLink : styles.link}
      >
        History
      </Link>
      <Collapse in={isOpen}>
        <div>
          <div className="nav flex-column">
            <Link
              className="btn"
              to="/History_FieldBooked"
              style={location.pathname === '/History_FieldBooked' ? styles.activeLink : styles.link}
            >
              Field booked
            </Link>
            <Link
              className="btn"
              to="/History_MatchJoined"
              style={location.pathname === '/History_MatchJoined' ? styles.activeLink : styles.link}
            >
              Match joined
            </Link>
          </div>
        </div>
      </Collapse>
      <Link
        className="btn"
        to="/field-owner-dashboard"
        style={location.pathname === '/field-owner-dashboard' ? styles.activeLink : styles.link}
      >
        Field management
      </Link>
    </nav>
  );
};

export default Sidebar;