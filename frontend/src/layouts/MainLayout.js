import Header from "../components/common/Header";
import styles from "./MainLayout.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const MainLayout = ({ children, role }) => {
  return (
    <div name="container" className={styles.container}>
      <div name="header">
        <Header role={role} />
      </div>
      <div name="body" class="row" style={{
        backgroundColor: "#FAFBFF",
      }}>
        <div className='page-content' style={{
          paddingTop: 90,
          width: "90%",
          margin: "auto",
          maxWidth: 1200,
        }}>{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
