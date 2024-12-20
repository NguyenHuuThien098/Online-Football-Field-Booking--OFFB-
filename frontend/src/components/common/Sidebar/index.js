import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import style from "./Sidebar.module.scss";
import HomeIcon from '@mui/icons-material/Home';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const role = localStorage.getItem('userRole');

  const styles = {
    link: {
      textDecoration: 'none',
      padding: '10px 20px', // Increased padding
      color: '#000',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
    },
    activeLink: {
      textDecoration:  'none',
      padding: '10px 20px', // Increased padding
      color: '#fff',
      backgroundColor: '#80bfff', // Lighter blue background color
      borderLeft: '20px solid #007bff',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
    },
    underline: {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '0%',
      height: '2px',
      backgroundColor: '#007bff',
      transition: 'width 0.3s ease',
    },
    activeUnderline: {
      width: '100%',
    },
    accordionHeader: {
      fontWeight: 'bold', 
    },
  };

  return (
    <nav className="nav flex-column">
      <Link
        className="btn"
        to="/"
        style={location.pathname === '/' ? styles.activeLink : styles.link}
      >
        <HomeIcon sx={{ mr: 1 }} />
        Available Field
        <span style={{ ...styles.underline, ...(location.pathname === '/' && styles.activeUnderline) }}></span>
      </Link>
      <Link
        className="btn"
        to="/openMatch"
        style={location.pathname === '/openMatch' ? styles.activeLink : styles.link}
      >
        <SportsSoccerIcon sx={{ mr: 1 }} />
        Open Match
        <span style={{ ...styles.underline, ...(location.pathname === '/openMatch' && styles.activeUnderline) }}></span>
      </Link>
      <hr />

      {isAuthenticated && (
        <>
          <Link
            className="btn"
            to="/personal"
            style={location.pathname === '/personal' ? styles.activeLink : styles.link}
          >
            <PersonIcon sx={{ mr: 1 }} />
            Personal
            <span style={{ ...styles.underline, ...(location.pathname === '/personal' && styles.activeUnderline) }}></span>
          </Link>
          <Link 
            className="btn" 
            onClick={() => setIsOpen(!isOpen)}
            style={isOpen ? styles.activeLink : styles.link}
          >
            <HistoryIcon sx={{ mr: 1 }} />
            History
            <span style={{ ...styles.underline, ...(isOpen && styles.activeUnderline) }}></span>
          </Link>
          <Collapse in={isOpen}>
            <div>
              <div className="nav flex-column">
                <Link
                  className="btn"
                  to="/History_FieldBooked"
                  style={location.pathname === '/History_FieldBooked' ? styles.activeLink : styles.link}
                >
                  <HistoryIcon sx={{ mr: 1 }} />
                  Field booked
                  <span style={{ ...styles.underline, ...(location.pathname === '/History_FieldBooked' && styles.activeUnderline) }}></span>
                </Link>
                <Link
                  className="btn"
                  to="/History_MatchJoined"
                  style={location.pathname === '/History_MatchJoined' ? styles.activeLink : styles.link}
                >
                  <HistoryIcon sx={{ mr: 1 }} />
                  Match joined
                  <span style={{ ...styles.underline, ...(location.pathname === '/History_MatchJoined' && styles.activeUnderline) }}></span>
                </Link>
              </div>
            </div>
          </Collapse>
          {role !== 'player' && (
            <Link
              className="btn"
              to="/field-owner-dashboard"
              style={location.pathname === '/field-owner-dashboard' ? styles.activeLink : styles.link}
            >
              <DashboardIcon sx={{ mr: 1 }} />
              Field management
              <span style={{ ...styles.underline, ...(location.pathname === '/field-owner-dashboard' && styles.activeUnderline) }}></span>
            </Link>
          )}
        </>
      )}
    </nav>
  );
};

export default Sidebar;