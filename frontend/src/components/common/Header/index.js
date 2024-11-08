import logo from "../../../img/iconTraiBanh.png";
import avatar from "../../../img/avatar.png";
import style from "./Header.module.scss";
const Header = () => {
  return (
    <div className="row border">
        <div name="left" className="col-2 p-0 border-end d-flex align-items-center">
            <div className="row">
                <div className="col-4">
                    <img className={style.icon + " img-fluid d-block icon-homepage mx-4"} src={logo} alt="iconTraiBanh"/>
                </div>
                <div className="col m-0 p-0">
                    <h1 className="mx-3">OFFB</h1>
                </div>
            </div>
        </div>
        <div name="middle" className="col-7 d-flex align-items-center">
            <h1 name="role" className="dropdown dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button"
                aria-haspopup="true" aria-expanded="false">Guest</h1>
            {/* <div className="dropdown-menu">
                <a className="dropdown-item" href="index.html">Quest</a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="HompagePlayer-view.html">Player</a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="HompageOwner-view.html">Owner</a>
            </div> */}
        </div>
        <div name="right" className="col border-start">
            <div className="row d-flex justify-content-evenly">
                <div className="col"></div>
                <div className="col"></div>
                <div className="col">
                    <div name="avatar">
                        <img src={avatar} className={style.icon + " img-fluid d-block icon-homepage"} alt="avatar"/>
                    </div>
                    <a href="login-view.html" className="btn">login</a>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Header;
