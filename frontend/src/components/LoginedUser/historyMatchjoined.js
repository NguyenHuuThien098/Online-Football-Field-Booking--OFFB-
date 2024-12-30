import "bootstrap/dist/css/bootstrap.min.css";
import { Button, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserShield } from 'react-icons/fa';  // Import icon quản lý

const HistoryMatchJoined = () => {
    const [matches, setMatches] = useState([]);
    const [requests, setRequests] = useState({});
    const [loadingRequests, setLoadingRequests] = useState({});
    const [processedRequests, setProcessedRequests] = useState({});
    const [isOwner, setIsOwner] = useState(false);
    const [isPlayer, setIsPlayer] = useState(false);
    const [playerMatchHistory, setPlayerMatchHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasNewRequests, setHasNewRequests] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        console.log('UserId:', userId);
        console.log('Role:', role);
        console.log('Token:', token);
        if (token && userId) {
            setIsOwner(role === 'field_owner');
            setIsPlayer(role === 'player');
        } else {
            setIsOwner(false);
            setIsPlayer(false);
        }
    }, []);

    const fetchMatches = async () => {
        const token = localStorage.getItem('token');
        const ownerId = isOwner ? localStorage.getItem('ownerId') : null;
        if (!ownerId) {
            alert('User information not found!');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/matches/owner/${ownerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMatches(response.data);
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    };

    const fetchPlayerMatchHistory = async (playerId) => {
        const token = localStorage.getItem('token');
        if (!playerId) {
            alert('User information not found!');
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5000/api/join/history/${playerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const formattedHistory = response.data.history.map(history => ({
                ...history,
                time: new Date(history.time).toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
            }));
            setPlayerMatchHistory(formattedHistory);
        } catch (error) {
            console.error('Error fetching match history:', error);
        }
    };

    const fetchRequests = async (matchId) => {
        const token = localStorage.getItem('token');
        if (loadingRequests[matchId]) return;
    
        // Đánh dấu trận đấu đang trong quá trình tải yêu cầu
        setLoadingRequests((prevState) => ({
            ...prevState,
            [matchId]: true,
        }));
    
        if (!matchId) {
            console.error('Invalid matchId!');
            return;
        }
    
        try {
            // Gọi API để lấy yêu cầu tham gia cho trận đấu
            const response = await axios.get(`http://localhost:5000/api/join/${matchId}/join-requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            // Lọc các yêu cầu có trạng thái pending (0) hoặc đã chấp nhận (1)
            const filteredRequests = response.data.pendingRequests.filter(request => [0, 1].includes(request.status));
    
            // Cập nhật yêu cầu tham gia
            setRequests((prevRequests) => ({
                ...prevRequests,
                [matchId]: filteredRequests,
            }));
    
            // Đánh dấu có yêu cầu mới
            if (filteredRequests.length > 0) {
                setHasNewRequests((prev) => ({
                    ...prev,
                    [matchId]: true, // Đánh dấu có yêu cầu mới
                }));
            }
        } catch (error) {
            console.error('Error fetching join requests:', error);
        } finally {
            // Đánh dấu hoàn tất việc tải yêu cầu
            setLoadingRequests((prevState) => ({
                ...prevState,
                [matchId]: false,
            }));
        }
    };
    

    const acceptPlayer = async (matchId, playerId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(
                'http://localhost:5000/api/join/accept',
                { matchId, playerId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert('Player accepted successfully!');

            setMatches((prevMatches) => {
                return prevMatches.map((match) =>
                    match.id === matchId
                        ? { ...match, remainingPlayerCount: match.remainingPlayerCount - 1 }
                        : match
                );
            });

            setProcessedRequests((prevState) => ({
                ...prevState,
                [`${matchId}_${playerId}`]: 'accepted',
            }));
        } catch (error) {
            console.error('Error accepting player:', error);
            alert('Unable to accept player.');
        }
    };

    const rejectPlayer = async (matchId, playerId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(
                'http://localhost:5000/api/join/reject',
                { matchId, playerId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert('Player rejected successfully!');

            setProcessedRequests((prevState) => ({
                ...prevState,
                [`${matchId}_${playerId}`]: 'rejected',
            }));
        } catch (error) {
            console.error('Error rejecting player:', error);
            alert('Unable to reject player.');
        }
    };

    const handleCancelJoinMatch = async (matchId) => {
        const token = localStorage.getItem('token');
        const playerId = localStorage.getItem('userId');
        if (!token) {
            alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
            return;
        }
        if (!playerId) {
            alert('Không tìm thấy ID người chơi. Vui lòng thử lại.');
            return;
        }
    
        const confirmCancel = window.confirm('Bạn có chắc muốn hủy tham gia trận đấu này?');
        if (!confirmCancel) return;
    
        setLoading(true);
        setError(null);
    
        try {
            const response = await axios.delete(
                'http://localhost:5000/api/join/cancel',
                {
                    data: { matchId, playerId },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert(response.data.message || 'Hủy tham gia thành công');
            setPlayerMatchHistory((prevHistory) =>
                prevHistory.filter((history) => history.matchId !== matchId)
            );
    
            // Tự động load lại trang sau khi hủy thành công
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert('Có lỗi khi hủy tham gia.');
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        if (isOwner) {
            fetchMatches();
        } else if (isPlayer) {
            const playerId = localStorage.getItem('userId');
            fetchPlayerMatchHistory(playerId);
        }
    }, [isOwner, isPlayer]);
    useEffect(() => {
        if (matches.length > 0) {
            matches.forEach(match => {
                // Nếu chưa có yêu cầu cho trận đấu này, gọi fetchRequests
                if (!requests[match.id]) {
                    fetchRequests(match.id);  // Lấy yêu cầu tham gia ngay lập tức khi trận đấu xuất hiện
                }
            });
        }
    }, [matches, requests]); 
    if (!isOwner && !isPlayer) {
        return null;
    }

    return (
        <div className="container mt-5">
            <h1>
                <FaUserShield /> {isOwner ? 'MATCH MANAGEMENT' : 'HISTORY OF MATCH PARTICIPATION'}
            </h1>
    
            {/* Section for Match Owner */}
            {isOwner && (
                <>
                    {matches.length === 0 ? (
                        <p>No matches available.</p>
                    ) : (
                        matches.map((match) => (
                            <div key={match.id} className="card mb-4">
                                <div className="card-body">
                                    <h3>Match Owner: {match.ownerName}</h3>
                                    <p><strong>Time:</strong> {new Date(match.time).toLocaleString()}</p>
                                    <p><strong>Notes:</strong> {match.notes}</p>
                                    <p><strong>Players:</strong> {match.playerCount}</p>
                                    <p><strong>Remaining Players:</strong> {match.remainingPlayerCount}</p>
                                    <h4>Join Requests:</h4>
    
                                    {/* Display join requests */}
                                    {requests[match.id] && requests[match.id].length > 0 ? (
                                        <>
                                            <p className="text-muted mt-2">Total Requests: {requests[match.id].length}</p>
                                            <table className="table table-striped table-hover mt-3">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">#</th>
                                                        <th scope="col">Player Name</th>
                                                        <th scope="col">Player Phone</th>
                                                        <th scope="col">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {requests[match.id].map((request, index) => (
                                                        <tr
                                                            key={request.playerId}
                                                            // Kiểm tra trạng thái yêu cầu và áp dụng lớp 'request-pending' nếu yêu cầu chưa được xử lý
                                                            className={processedRequests[`${match.id}_${request.playerId}`] !== 'accepted' && processedRequests[`${match.id}_${request.playerId}`] !== 'rejected' ? 'request-pending' : ''}
                                                        >
                                                            <th scope="row">{index + 1}</th>
                                                            <td>{request.playerName}</td>
                                                            <td>{request.phoneNumber}</td>
                                                            <td>
                                                                {processedRequests[`${match.id}_${request.playerId}`] !== 'accepted' && processedRequests[`${match.id}_${request.playerId}`] !== 'rejected' ? (
                                                                    <>
                                                                        <button
                                                                            className="btn btn-success me-2"
                                                                            onClick={() => acceptPlayer(match.id, request.playerId)}
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-danger"
                                                                            onClick={() => rejectPlayer(match.id, request.playerId)}
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted">Processed</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    ) : loadingRequests[match.id] ? (
                                        <p>Loading requests...</p>
                                    ) : (
                                        <p>No requests available.</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </>
            )}
    
            {/* Section for Player History */}
            {isPlayer && (
                <>
                    {playerMatchHistory.length === 0 ? (
                        <p>No history data available</p>
                    ) : (
                        <ul className="list-group">
                            {playerMatchHistory.map((history, index) => (
                                <li key={index} className="list-group-item">
                                    {index + 1}.
                                    <p><strong>Match Owner:</strong> {history.ownerName}</p>
                                    <p><strong>Match Start Time:</strong> {history.time}</p>
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        {history.status === 1 ? (
                                            <span className="text-success">Joined</span>
                                        ) : history.status === 2 ? (
                                            <span className="text-danger">Rejected</span>
                                        ) : (
                                            <span className="text-warning">Pending</span>
                                        )}
                                    </p>
                                    {history.status === 1 && (
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleCancelJoinMatch(history.matchId)}
                                        >
                                            Cancel Participation
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
    
            {/* CSS Styling */}
            <style>{`
                /* Button hover effect */
                button:hover {
                    background-color: #0056b3;
                    transition: background-color 0.3s ease;
                }
    
                button:active {
                    background-color: #003d80;
                }
    
                /* List group item hover effect */
                .list-group-item {
                    transition: background-color 0.3s ease;
                }
    
                .list-group-item:hover {
                    background-color: #f0f0f0;
                }
    
                /* Table row hover effect for both player and owner */
                .table-striped tbody tr:nth-of-type(odd) {
                    background-color: #f9f9f9;
                }
    
                .table-hover tbody tr:hover {
                    background-color: #e9e9e9;
                }
    
                /* Header style */
                h1 {
                    display: flex;
                    align-items: center;
                }
    
                h1 i {
                    margin-right: 10px;
                    font-size: 24px;
                    color: #007bff;
                }
    
                h3, p {
                    color: #333;
                }
    
                button {
                    padding: 8px 16px;
                    font-size: 16px;
                    cursor: pointer;
                    border-radius: 5px;
                }
    
                /* Blinking effect for pending requests with red flashing */
                .request-pending {
                    animation: blink-animation 1s infinite;
                    background-color: #ffcccc; /* Light red background */
                }
    
                @keyframes blink-animation {
                    0% {
                        background-color: #ffcccc;
                    }
                    50% {
                        background-color: #ff6666; /* Darker red during blinking */
                    }
                    100% {
                        background-color: #ffcccc;
                    }
                }
            `}</style>
        </div>
    );
    
};

export default HistoryMatchJoined;
