import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";

const History_MatchJoined = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState({});
    const [loadingRequests, setLoadingRequests] = useState({});
    const [processedRequests, setProcessedRequests] = useState({});  // Lưu trạng thái yêu cầu đã được xử lý

    const getOwnerId = () => {
        const token = localStorage.getItem('token');
        if (token) {
            return localStorage.getItem('ownerId');
        }
        return null;
    };

    const fetchMatches = async () => {
        const ownerId = getOwnerId();
        if (!ownerId) {
            alert('Không tìm thấy thông tin người dùng!');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/matches/owner/${ownerId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setMatches(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách trận đấu:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async (matchId) => {
        if (loadingRequests[matchId]) return;
        setLoadingRequests((prevState) => ({
            ...prevState,
            [matchId]: true,
        }));

        if (!matchId) {
            console.error('matchId không hợp lệ!');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/join/${matchId}/join-requests`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            // Lọc các yêu cầu với ba trạng thái (0: Chờ xử lý, 1: Đã chấp nhận, 2: Đã từ chối)
            const filteredRequests = response.data.pendingRequests.filter(request => [0, 1, 2].includes(request.status));
            setRequests((prevRequests) => ({
                ...prevRequests,
                [matchId]: filteredRequests,
            }));
        } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu cầu:', error);
        } finally {
            setLoadingRequests((prevState) => ({
                ...prevState,
                [matchId]: false,
            }));
        }
    };

    const acceptPlayer = async (matchId, playerId) => {
        try {
            await axios.post(
                'http://localhost:5000/api/join/accept',
                { matchId, playerId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            alert('Đã chấp nhận player thành công!');

            setMatches((prevMatches) => {
                return prevMatches.map((match) =>
                    match.id === matchId
                        ? { ...match, remainingPlayerCount: match.remainingPlayerCount - 1 }
                        : match
                );
            });

            // Cập nhật trạng thái yêu cầu là đã xử lý (để ẩn các nút chấp nhận và từ chối)
            setProcessedRequests((prevState) => ({
                ...prevState,
                [`${matchId}_${playerId}`]: 'accepted',
            }));
        } catch (error) {
            console.error('Lỗi khi chấp nhận player:', error);
            alert('Không thể chấp nhận player.');
        }
    };

    const rejectPlayer = async (matchId, playerId) => {
        try {
            await axios.post(
                'http://localhost:5000/api/join/reject',
                { matchId, playerId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            alert('Đã từ chối player thành công!');

            // Cập nhật trạng thái yêu cầu là đã xử lý (để ẩn các nút chấp nhận và từ chối)
            setProcessedRequests((prevState) => ({
                ...prevState,
                [`${matchId}_${playerId}`]: 'rejected',
            }));
        } catch (error) {
            console.error('Lỗi khi từ chối player:', error);
            alert('Không thể từ chối player.');
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    if (loading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="container mt-5">
            <h1>Quản lý trận đấu</h1>
            {matches.length === 0 ? (
                <p>Không có trận đấu nào.</p>
            ) : (
                matches.map((match) => (
                    <div key={match.id}>
                        <h3>Trận đấu: {match.ownerName} </h3>
                        <p>Thời gian: {new Date(match.time).toLocaleString()}</p>
                        <p>Ghi chú: {match.notes}</p>
                        <p>Số lượng người chơi: {match.playerCount}</p>
                        <p>Số lượng người chơi còn lại: {match.remainingPlayerCount}</p>

                        <h4>Yêu cầu tham gia:</h4>
                        <button
                            className="btn btn-info"
                            onClick={() => fetchRequests(match.id)}
                        >
                            Xem yêu cầu tham gia
                        </button>

                        {requests[match.id] && requests[match.id].length > 0 ? (
                            <table className="table table-striped table-hover mt-3">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Player ID</th>
                                        <th scope="col">Actions</th>
                                        <th scope="col">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests[match.id].map((request, index) => (
                                        <tr key={request.playerId}>
                                            <th scope="row">{index + 1}</th>
                                            <td>{request.playerId}</td>
                                            <td>
                                                {/* Ẩn nút nếu yêu cầu đã được xử lý */}
                                                {processedRequests[`${match.id}_${request.playerId}`] !== 'accepted' && 
                                                    processedRequests[`${match.id}_${request.playerId}`] !== 'rejected' && (
                                                        <>
                                                            <button
                                                                className="btn btn-success me-2"
                                                                onClick={() => acceptPlayer(match.id, request.playerId)}
                                                            >
                                                                Chấp nhận
                                                            </button>
                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => rejectPlayer(match.id, request.playerId)}
                                                            >
                                                                Từ chối
                                                            </button>
                                                        </>
                                                    )
                                                }
                                            </td>
                                            <td>
                                                {/* Hiển thị trạng thái */}
                                                {request.status === 0 && <span className="text-warning">Chờ xử lý</span>}
                                                {request.status === 1 && <span className="text-success">Đã chấp nhận</span>}
                                                {request.status === 2 && <span className="text-danger">Đã từ chối</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : loadingRequests[match.id] ? (
                            <p>Đang tải yêu cầu...</p>
                        ) : (
                            <p>Không có yêu cầu tham gia nào.</p>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default History_MatchJoined;
