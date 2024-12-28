import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import style from "./Sidebar.module.scss";
import HomeIcon from '@mui/icons-material/Home';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // New icon

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const role = localStorage.getItem('userRole');
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const styles = {
    link: {
      textDecoration: 'none',
      padding: '10px 20px', // Increased padding
      color: '#000',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      transition: 'background-color 0.3s ease',
    },
    activeLink: {
      textDecoration: 'none',
      padding: '10px 20px', // Increased padding
      color: '#fff',
      backgroundColor: '#80bfff', // Lighter blue background color
      borderLeft: '20px solid #007bff',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      fontStyle: 'italic',
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
    hover: {
      backgroundColor: '#f0f0f0',
    },
    activeHover: {
      backgroundColor: '#80bfff',
    },
    nestedLink: {
      textDecoration: 'none',
      padding: '10px 40px', // Increased padding to indent
      color: '#000',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      transition: 'background-color 0.3s ease',
    },
  };

  // const sidebarStyle = {
  //   boxShadow: '3px 0 5px -2px rgba(0,0,0,0.2)', // Add shadow only on the right side
  // };

  const isHistoryActive = location.pathname.startsWith('/History');

  return (
    <nav className="nav flex-column">
      {console.log(role)}
      <Link
        className="btn"
        to="/"
        style={location.pathname === '/' ? styles.activeLink : styles.link}
        onMouseEnter={(e) => {
          if (location.pathname !== '/') e.currentTarget.style.backgroundColor = styles.hover.backgroundColor;
        }}
        onMouseLeave={(e) => {
          if (location.pathname !== '/') e.currentTarget.style.backgroundColor = '';
        }}
      >
        <HomeIcon sx={{ mr: 1 }} />
        Available Field
        <span style={{ ...styles.underline, ...(location.pathname === '/' && styles.activeUnderline) }}></span>
      </Link>
      <Link
        className="btn"
        to="/openMatch"
        style={location.pathname === '/openMatch' ? styles.activeLink : styles.link}
        onMouseEnter={(e) => {
          if (location.pathname !== '/openMatch') e.currentTarget.style.backgroundColor = styles.hover.backgroundColor;
        }}
        onMouseLeave={(e) => {
          if (location.pathname !== '/openMatch') e.currentTarget.style.backgroundColor = '';
        }}
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
            onMouseEnter={(e) => {
              if (location.pathname !== '/personal') e.currentTarget.style.backgroundColor = styles.hover.backgroundColor;
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/personal') e.currentTarget.style.backgroundColor = '';
            }}
          >
            <PersonIcon sx={{ mr: 1 }} />
            Personal
            <span style={{ ...styles.underline, ...(location.pathname === '/personal' && styles.activeUnderline) }}></span>
          </Link>
          <Link
            className="btn"
            onClick={() => setIsOpen(!isOpen)}
            style={isHistoryActive ? styles.activeLink : styles.link}
            onMouseEnter={(e) => {
              if (!isHistoryActive) e.currentTarget.style.backgroundColor = styles.hover.backgroundColor;
            }}
            onMouseLeave={(e) => {
              if (!isHistoryActive) e.currentTarget.style.backgroundColor = '';
            }}
          >
            <HistoryIcon sx={{ mr: 1 }} />
            History
            <ExpandMoreIcon sx={{ ml: 'auto' }} />
            <span style={{ ...styles.underline, ...(isHistoryActive && styles.activeUnderline) }}></span>
          </Link>
          <Collapse in={isOpen || isHistoryActive}>
            <div>
              <div className="nav flex-column">
                <Link
                  className="btn"
                  to="/historyFieldBooked"
                  style={location.pathname === '/historyFieldBooked' ? styles.activeLink : styles.nestedLink}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/historyFieldBooked') e.currentTarget.style.backgroundColor = styles.hover.backgroundColor;
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/historyFieldBooked') e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <HistoryIcon sx={{ mr: 1 }} />
                  Field booked
                  <span style={{ ...styles.underline, ...(location.pathname === '/historyFieldBooked' && styles.activeUnderline) }}></span>
                </Link>
                <Link
                  className="btn"
                  to="/historyMatchJoined"
                  style={location.pathname === '/historyMatchJoined' ? styles.activeLink : styles.nestedLink}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/historyMatchJoined') e.currentTarget.style.backgroundColor = styles.hover.backgroundColor;
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/historyMatchJoined') e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <HistoryIcon sx={{ mr: 1 }} />
                  Match joined
                  <span style={{ ...styles.underline, ...(location.pathname === '/historyMatchJoined' && styles.activeUnderline) }}></span>
                </Link>
              </div>
            </div>
          </Collapse>
          {role === 'field_owner' && (
            <Link
              className="btn"
              to="/field-owner-dashboard"
              style={location.pathname === '/field-owner-dashboard' ? styles.activeLink : styles.link}
              onMouseEnter={(e) => {
                if (location.pathname !== '/field-owner-dashboard') e.currentTarget.style.backgroundColor = styles.hover.backgroundColor;
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/field-owner-dashboard') e.currentTarget.style.backgroundColor = '';
              }}
            >
              <DashboardIcon sx={{ mr: 1 }} />
              Field management
              <span style={{ ...styles.underline, ...(location.pathname === '/field-owner-dashboard' && styles.activeUnderline) }}></span>
            </Link>
          )}
          {role === 'admin' && (
            <Link
              className="btn"
              to="/admin-dashboard"
              style={location.pathname === '/admin-dashboard' ? styles.activeLink : styles.link}
              onMouseEnter={(e) => {
                if (location.pathname !== '/admin-dashboard') e.currentTarget.style.backgroundColor = styles.hover.backgroundColor;
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/admin-dashboard') e.currentTarget.style.backgroundColor = '';
              }}
            >
              <AdminPanelSettingsIcon sx={{ mr: 1 }} /> {/* Updated icon */}
              Admin dashboard
              <span style={{ ...styles.underline, ...(location.pathname === '/admin-dashboard' && styles.activeUnderline) }}></span>
            </Link>
          )}
        </>
      )}
    </nav>
  );
};

export default Sidebar;