import Accordion from 'react-bootstrap/Accordion';

const Sidebar = () => {
  return (
    <nav className="nav flex-column bg-light">
      <a className="btn" href="/">Available Field</a>
      <a className="btn">Open Match</a>

      <hr />

      <a className="btn" href="Personal">Personal</a>


      <Accordion defaultActiveKey="0" flush>
        <Accordion.Item>
          <Accordion.Header>
            <div className="d-flex justify-content-center w-100">
              <p>History</p>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="nav flex-column"> 
              <a className="btn" href="History_FieldBooked">Field booked</a>
              <a className="btn" href="History_Matchjoined">Math joined</a>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <a className="btn" href='/field-owner-dashboard'>Field managerment</a>
    </nav>

  );
};

export default Sidebar;
