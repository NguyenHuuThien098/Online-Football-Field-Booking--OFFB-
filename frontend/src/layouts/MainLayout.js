import React from 'react'; 
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import styles from "./MainLayout.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const MainLayout = ({ children }) => {
  return (
    <div name="container" className={"w-100"}>
      {/* Header */}
      <div name="header" className={styles.stickyHeader}>
        <Header role={role} />
      </div>
      
      {/* Body */}
      <div name="body" className="row">
        {/* Sidebar */}
        <div name="sidebar" className={`col-2 vh-100 p-0 border-end ${styles.stickySidebar}`}>
          <Sidebar />
        </div>

        {/* Content */}
        <div name="content" className={`col border-start ${styles.content}`}>
          {children}
        </div>  
      </div>
    </div>
  );
};

export default MainLayout;
