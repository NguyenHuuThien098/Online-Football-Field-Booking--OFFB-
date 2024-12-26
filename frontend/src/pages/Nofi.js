import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Nofi = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");  // Đã thay đổi từ "match" thành "all" vì không phân loại nữa
    const [role, setRole] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [notificationsCount, setNotificationsCount] = useState(0); // Số lượng thông báo chưa đọc

    const [currentPage, setCurrentPage] = useState(1);  // Không phân biệt giữa match và field nữa

    const itemsPerPage = 10; // Mỗi trang sẽ hiển thị 10 thông báo
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            const userRole = localStorage.getItem("role");
            setRole(userRole);

            try {
                const endpoint =
                    userRole === "field_owner"
                        ? `http://localhost:5000/api/notifications/owner/${userId}`
                        : `http://localhost:5000/api/notifications/player/${userId}`;

                const notificationsResponse = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const notificationsData = notificationsResponse.data.notifications || [];
                setNotifications(notificationsData);

                const unreadCount = notificationsData.filter(notification => !notification.isRead).length;
                setNotificationsCount(unreadCount); // Cập nhật số lượng thông báo chưa đọc
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setError("Không thể tải thông báo. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const renderNotifications = () => {
        // Với 'player', hiển thị tất cả thông báo mà không phân loại
        const filteredNotifications = notifications.sort((a, b) => {
            if (sortOrder === "desc") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
        });

        const totalNotifications = filteredNotifications.length;
        const totalPages = Math.ceil(totalNotifications / itemsPerPage);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const currentNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

        if (currentNotifications.length === 0) {
            return <p>Không có thông báo nào.</p>;
        }

        return (
            <div>
                <ul className="notification-list">
                    {currentNotifications.map((notification) => (
                        <li key={notification.id} className="notification-item">
                            <p><strong>Thông báo:</strong> {notification.message}</p>
                            {(notification.message.includes("đã yêu cầu đặt sân") || notification.message.includes("xác nhận")) && (
    <button onClick={() => navigate("/History_FieldBooked")}>Xem lịch sử đặt sân</button>
)}

{(notification.message.includes("đã yêu cầu tham gia trận đấu") || notification.message.includes("chấp nhận")) && (
    <button onClick={() => navigate("/History_Matchjoined")}>Xem lịch sử tham gia trận đấu</button>
)}

                        </li>
                    ))}
                </ul>

                {/* Phân trang */}
                <div className="pagination">
                    <button
                        onClick={() => changePage((currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                        onClick={() => changePage((currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    const changePage = (pageNumber) => {
        const totalPages = Math.ceil(notifications.length / itemsPerPage);

        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }   
    };

    if (loading) {
        return <div className="loading-message">Đang tải thông báo...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div>
            <style>
                {`
                    .tabs {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 20px;
                    }
                    .tab {
                        padding: 10px 20px;
                        cursor: pointer;
                        font-size: 1rem;
                        font-weight: bold;
                        color: #007bff;
                        border-bottom: 2px solid transparent;
                        transition: all 0.3s ease;
                    }
                    .tab.active {
                        color: #fff;
                        background-color: #007bff;
                        border-bottom: 2px solid #007bff;
                        border-radius: 5px;
                    }
                    .notification-list {
                        transition: transform 0.3s ease-in-out;
                    }
                    .notification-item {
                        border: 1px solid #ddd;
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 8px;
                        background-color: #f9f9f9;
                        transition: background-color 0.3s ease, transform 0.3s ease;
                    }
                    .notification-item p {
                        margin: 8px 0;
                        font-size: 1rem;
                        color: #333;
                    }
                    .notification-item:hover {
                        background-color: #f0f8ff;
                        transform: translateY(-5px);
                    }
                    .pagination {
                        display: flex;
                        justify-content: center;
                        margin-top: 20px;
                    }
                    .pagination button {
                        padding: 5px 15px;
                        margin: 0 10px;
                        cursor: pointer;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                    }
                    .pagination button:disabled {
                        background-color: #ddd;
                        cursor: not-allowed;
                    }
                    .pagination button:hover {
                        background-color: #0056b3;
                    }
                    .pagination span {
                        font-size: 1rem;
                        margin: 0 10px;
                    }
                `}
            </style>

            {renderNotifications()}
        </div>
    );
};

export default Nofi;
