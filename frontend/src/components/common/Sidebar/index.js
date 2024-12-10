import { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import style from "./Sidebar.module.scss";



const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="nav flex-column">
      <a className="btn" href="/">Available Field</a>
      <a className="btn">Open Match</a>
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
