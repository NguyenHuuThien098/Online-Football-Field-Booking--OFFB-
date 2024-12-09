import React, { useState, useEffect } from "react";
import logo from "../../../img/iconTraiBanh.png";
import avatar from "../../../img/avatar.png";
import { useNavigate } from 'react-router-dom';

import { HeaderWrapper, Icon, ContainerLogo, BranchName, ContainerNaviLink, NaviItem } from './header.styled';
const Header = ({ role }) => {
  const [showMenu, setShowMenu] = useState(false); // Trạng thái hiển thị menu
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Trạng thái đăng nhập
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Nếu có token, người dùng đang đăng nhập
  }, []);


  const navigationItem = [
    {
      title: 'Available Field',
      href: '/',
    },
    {
      title: 'Open Match',
      href: '',
    },
    {
      title: 'Personal',
      href: '/Personal',
    },
    {
      title: 'History',
      href: '/',
      subMenu: [
        {
          title: 'Field booked',
          href: '/History_FieldBooked',
        },
        {
          title: 'Math joined',
          href: '/History_Matchjoined',
        }
      ]
    },
    {
      title: 'Field managerment',
      href: '/field-owner-dashboard',
    }
  ]

  const handleLogoClick = () => {
    window.location.reload(); // Reload lại trang
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev); // Đổi trạng thái hiển thị menu
  };

  const handleLogout = () => {
    // Xử lý logout
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setShowMenu(false); // Ẩn menu sau khi logout
    window.location.href = "/"; // Chuyển hướng về trang login
  };

  return (
    <HeaderWrapper>
      <ContainerLogo>
        <Icon
          onClick={handleLogoClick}
          className={`img-fluid`}
          src={logo}
          alt="iconTraiBanh"
          style={{ cursor: "pointer" }} // Thêm con trỏ để nhận biết click
        />
        <BranchName>OFFB</BranchName>
      </ContainerLogo>

      <ContainerNaviLink>
        {
          navigationItem.map((item, index) => {
            if (item.subMenu) {
              return (
                <div key={index} className="dropdown">
                  <NaviItem className="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {item.title}
                  </NaviItem>
                  <div className="dropdown-list">
                    {
                      item.subMenu.map((subItem, index) => {
                        return (
                          <a key={index} className="dropdown-item" href={subItem.href}>{subItem.title}</a>
                        )
                      })
                    }
                  </div>
                </div>
              )
            } else {
              return (
                <NaviItem key={item.title + index} onClick={() => navigate(item.href)}>
                  {item.title}
                </NaviItem>
              )
            }
          })
        }
        <div name="middle" className="">
          <div>{role}</div>
        </div>
        <Icon
          src={avatar}
          className={``}
          alt="avatar"
          style={{ cursor: "pointer" }}
          onClick={toggleMenu}
        />
        {showMenu && (
          <div
            style={{
              position: "absolute",
              top: "80px",
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
      </ContainerNaviLink>

    </HeaderWrapper>

  );
};

export default Header;
