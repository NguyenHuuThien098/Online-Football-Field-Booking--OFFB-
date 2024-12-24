import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom"; 

const Nofi = () => {
    const [notifications, setNotifications] = useState([]);
    const [smallFields, setSmallFields] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("match"); 
    const [role, setRole] = useState(""); 
    const [sortOrder, setSortOrder] = useState("desc"); 
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

                const smallFieldIds = notificationsData
                    .map((notification) => notification.smallFieldId)
                    .filter((id) => id);

                if (smallFieldIds.length > 0) {
                    const db = getDatabase();
                    const smallFieldsRef = ref(db, "smallFields");
                    const smallFieldsSnapshot = await get(smallFieldsRef);

                    if (smallFieldsSnapshot.exists()) {
                        const smallFieldsData = smallFieldsSnapshot.val();
                        const filteredSmallFields = smallFieldIds.reduce((result, id) => {
                            if (smallFieldsData[id]) {
                                result[id] = smallFieldsData[id];
                            }
                            return result;
                        }, {});

                        setSmallFields(filteredSmallFields);
                    }
                }
            } catch (error) {
                console.error("Error fetching notifications or small fields:", error);
                setError("Không thể tải thông báo. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const renderNotifications = (type) => {
        const filteredNotifications = notifications
            .filter((notification) => {
                if (type === "match") {
                    return !notification.date;
                } else if (type === "field") {
                    return notification.date;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortOrder === "desc") {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                } else {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                }
            });

        if (filteredNotifications.length === 0) {
            return <p>Không có thông báo nào.</p>;
        }

        return (
            <ul className="notification-list">
                {filteredNotifications.map((notification) => (
                    <li key={notification.id} className="notification-item">
                        {notification.date ? (
                            <>
                                <p><strong>Thông báo:</strong> {notification.message}</p>
                                <p><strong>Thời gian yêu cầu đặt sân:</strong> {new Date(notification.date).toLocaleString("vi-VN")}</p>
                                {notification.message.includes("đã yêu cầu đặt sân") && (
                                    <button onClick={() => navigate("/History_FieldBooked")}>Xem lịch sử đặt sân</button>
                                )}
                                {notification.message.includes("đã yêu cầu tham gia trận đấu") && (
                                    <button onClick={() => navigate("/History_Matchjoined")}>Xem lịch sử tham gia trận đấu</button>
                                )}
                            </>
                        ) : (
                            <>
                                <p><strong>Thông báo:</strong> {notification.message}</p>
                                {notification.message.includes("đã yêu cầu đặt sân") && (
                                    <button onClick={() => navigate("/History_FieldBooked")}>Xem lịch sử đặt sân</button>
                                )}
                                {notification.message.includes("đã yêu cầu tham gia trận đấu") && (
                                    <button onClick={() => navigate("/History_Matchjoined")}>Xem lịch sử tham gia trận đấu</button>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        );
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
                        opacity: 0;
                        animation: fadeIn 0.5s forwards;
                    }

                    .notification-item:hover {
                        background-color: #f0f8ff;
                        transform: translateY(-5px);
                    }

                    .error-message {
                        color: red;
                        font-weight: bold;
                        font-size: 1.2rem;
                        text-align: center;
                        margin-top: 20px;
                    }

                    .loading-message {
                        font-size: 1.2rem;
                        text-align: center;
                        color: #007bff;
                        margin-top: 20px;
                    }

                    .sort-buttons {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 10px;
                    }

                    .sort-button {
                        padding: 5px 15px;
                        margin: 0 5px;
                        cursor: pointer;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        transition: background-color 0.3s ease;
                    }

                    .sort-button:hover {
                        background-color: #0056b3;
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                `}
            </style>

            <div className="sort-buttons">
                <button className="sort-button" onClick={() => setSortOrder("desc")}>Mới nhất</button>
                <button className="sort-button" onClick={() => setSortOrder("asc")}>Cũ nhất</button>
            </div>

            {role === "field_owner" ? (
                <>
                    <div className="tabs">
                        <div
                            className={`tab ${activeTab === "match" ? "active" : ""}`}
                            onClick={() => setActiveTab("match")}
                        >
                            Thông báo yêu cầu tham gia trận đấu
                        </div>
                        <div
                            className={`tab ${activeTab === "field" ? "active" : ""}`}
                            onClick={() => setActiveTab("field")}
                        >
                            Thông báo yêu cầu đặt sân
                        </div>
                    </div>

                    {activeTab === "match" && renderNotifications("match")}
                    {activeTab === "field" && renderNotifications("field")}
                </>
            ) : (
                <>{renderNotifications()}</>
            )}
        </div>
    );
};

export default Nofi;
