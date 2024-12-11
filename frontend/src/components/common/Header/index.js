import logo from "../../../img/iconTraiBanh.png";
import avatar from "../../../img/avatar.png";
import style from "./Header.module.scss";
const Header = () => {
  return (
    <div className="row border">
      <div name="left" className="col-2 p-3 border-end d-flex align-items-center">
        <div className="row">
          <div className="col-4">
            {/* Thêm sự kiện onClick để reload */}
            <img
              onClick={handleLogoClick}
              className={`${style.icon} img-fluid d-block icon-homepage mx-4`}
              src={logo}
              alt="iconTraiBanh"
              style={{ cursor: "pointer" }} // Thêm con trỏ để nhận biết click
            />
          </div>
          <div className="col m-0 p-0">
            <h1 className="mx-3">OFFB</h1>
          </div>
        </div>
      </div>
      <div name="middle" className="col-7 d-flex align-items-center">
        <h1 name="role">{role}</h1>
      </div>
      <div name="right" className="col border-start">
        <div className="row d-flex justify-content-evenly">
          <div className="col"></div>
          <div className="col"></div>
          <div className="col">
            <div name="avatar" style={{ position: "relative" }}>
              {/* Khi nhấn vào avatar sẽ hiển thị/ẩn menu */}
              <img
                src={avatar}
                className={`${style.icon} img-fluid d-block icon-homepage`}
                alt="avatar"
                style={{ cursor: "pointer" }} // Thêm con trỏ để nhận biết click
                onClick={toggleMenu} // Thay đổi trạng thái khi nhấn vào avatar
              />
              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "120%", // Hiển thị bên dưới avatar
                    right: "0",
                    zIndex: 1,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {!isLoggedIn ? (
                    <a
                      href="/login"
                      className="btn btn-primary w-100"
                      style={{ margin: "5px 0" }}
                    >
                      Login
                    </a>
                  ) : (
                    <>
                      <button
                        className="btn btn-danger w-100"
                        style={{ margin: "5px 0" }}
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
