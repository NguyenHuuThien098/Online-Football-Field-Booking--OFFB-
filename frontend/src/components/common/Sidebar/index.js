import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import style from "./Sidebar.module.scss";
import HomeIcon from '@mui/icons-material/Home';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  const styles = {
    link: {
      textDecoration: 'none',
      padding: '10px 15px',
      color: '#000',
      display: 'flex',
      alignItems: 'center',
    },
    activeLink: {
      textDecoration:  'none',
      padding: '10px 15px',
      color: '#fff',
      backgroundColor: '#80bfff', // Lighter blue background color
      borderLeft: '20px solid #007bff',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
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
        <HomeIcon sx={{ mr: 1 }} />
        Available Field
      </Link>
      <Link
        className="btn"
        to="/openMatch"
        style={location.pathname === '/openMatch' ? styles.activeLink : styles.link}
      >
        <SportsSoccerIcon sx={{ mr: 1 }} />
        Open Match
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
          </Link>
          <Link 
            className="btn" 
            onClick={() => setIsOpen(!isOpen)}
            style={isOpen ? styles.activeLink : styles.link}
          >
            <HistoryIcon sx={{ mr: 1 }} />
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
                  <HistoryIcon sx={{ mr: 1 }} />
                  Field booked
                </Link>
                <Link
                  className="btn"
                  to="/History_MatchJoined"
                  style={location.pathname === '/History_MatchJoined' ? styles.activeLink : styles.link}
                >
                  <HistoryIcon sx={{ mr: 1 }} />
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
            <ManageAccountsIcon sx={{ mr: 1 }} />
            Field management
          </Link>
        </>
      )}
    </nav>
  );
};

export default Sidebar;