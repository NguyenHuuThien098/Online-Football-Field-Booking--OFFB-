import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import styles from "./MainLayout.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const MainLayout = ({ children, role }) => {
  return (
    <div name="container" className={"w-100"}>
      {/* Header */}
      <div name="header">    <Header role={role} />      </div>
      
      {/* Body */}
      <div name="body" class="row">
        {/* Sidebar */}
        <div name="sidebar" class="col-2 vh-100 p-0">
          <Sidebar />
        </div>

      {/* Content */}
        <div name="content" className="col p-0 border-start">{children}</div>  
      </div>
    </div>
  );
};

export default MainLayout;
