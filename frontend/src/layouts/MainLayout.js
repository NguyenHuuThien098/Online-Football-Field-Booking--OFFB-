import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import styles from "./MainLayout.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const MainLayout = ({ children, role }) => {
  return (
    <div name="container" className={styles.container}>
      <div name="header">
        <Header role={role} />
      </div>
      <div name="body" class="row">
        <div name="sidebar" class="col-2 vh-100 p-0">
          <Sidebar />
        </div>
        <div name="content" className="col p-0 border-start">{children}</div>  
      </div>
    </div>
  );
};

export default MainLayout;
