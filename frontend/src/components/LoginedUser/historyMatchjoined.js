
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, CircularProgress } from '@mui/material';
import styled from 'styled-components';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1976d2;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
`;

const TableHeader = styled.th`
  background-color: #1976d2;
  color: white;
  padding: 0.8rem;
  text-align: left;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #ddd;
`;

const TableCell = styled.td`
  padding: 0.8rem;
  text-align: left;
`;

const ErrorAlert = styled.div`
  background-color: #f8d7da;
  color: #842029;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0.5rem;
`;

const HistoryMatchJoined = () => {
    const isLoading = false; // Mock loading state
    //const error = ''; // Mock error state
    const mockMatches = [
        {
            id: 1,
            name: 'Bitcode',
            owner: 'Tien',
            date: '16/10/2024',
            time: '17:00',
        },
        {
            id: 2,
            name: 'Sân bóng AT',
            owner: 'Lâm',
            date: '17/10/2024',
            time: '19:00',
        },
        {
            id: 3,
            name: 'Bitcode',
            owner: 'Tien',
            date: '18/10/2024',
            time: '17:00',
        },
    ];
    const [matches, setMatches] = useState([]);
    const [requests, setRequests] = useState({});
    const [loadingRequests, setLoadingRequests] = useState({});
    const [processedRequests, setProcessedRequests] = useState({});
    const [isOwner, setIsOwner] = useState(false);
    const [isPlayer, setIsPlayer] = useState(false);
    const [playerMatchHistory, setPlayerMatchHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            alert('Không tìm thấy thông tin người dùng!');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/matches/owner/${ownerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMatches(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách trận đấu:', error);
        }
    };

    const fetchPlayerMatchHistory = async (playerId) => {
        const token = localStorage.getItem('token');
        if (!playerId) {
            alert('Không tìm thấy thông tin người dùng!');
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5000/api/join/history/${playerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const formattedHistory = response.data.history.map(history => ({
                ...history,
                time: new Date(history.time).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
            }));
            setPlayerMatchHistory(formattedHistory);
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử trận đấu:', error);
        }
    };

    const fetchRequests = async (matchId) => {
        const token = localStorage.getItem('token');
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
                headers: { Authorization: `Bearer ${token}` },
            });

            const filteredRequests = response.data.pendingRequests.filter(request => [0, 1].includes(request.status));
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
        const token = localStorage.getItem('token');
        try {
            await axios.post(
                'http://localhost:5000/api/join/accept',
                { matchId, playerId },
                {
                    headers: { Authorization: `Bearer ${token}` },
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
        const token = localStorage.getItem('token');
        try {
            await axios.post(
                'http://localhost:5000/api/join/reject',
                { matchId, playerId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert('Đã từ chối player thành công!');

            setProcessedRequests((prevState) => ({
                ...prevState,
                [`${matchId}_${playerId}`]: 'rejected',
            }));
        } catch (error) {
            console.error('Lỗi khi từ chối player:', error);
            alert('Không thể từ chối player.');
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

    if (!isOwner && !isPlayer) {
        return null;
    }

    // return (
    //     <Container>
    //         <Title>Match Joined</Title>
    //         {error && <ErrorAlert>{error}</ErrorAlert>}
    //         {isLoading ? (
    //             <div style={{ textAlign: 'center' }}>
    //                 <CircularProgress />
    //             </div>
    //         ) : (
    //             <TableWrapper>
    //                 <Table>
    //                     <thead>
    //                         <TableRow>
    //                             <TableHeader>#</TableHeader>
    //                             <TableHeader>Name</TableHeader>
    //                             <TableHeader>Owner</TableHeader>
    //                             <TableHeader>Date</TableHeader>
    //                             <TableHeader>Time</TableHeader>
    //                         </TableRow>
    //                     </thead>
    //                     <tbody>
    //                         {mockMatches.length > 0 ? (
    //                             mockMatches.map((match) => (
    //                                 <TableRow key={match.id}>
    //                                     <TableCell>{match.id}</TableCell>
    //                                     <TableCell>{match.name}</TableCell>
    //                                     <TableCell>{match.owner}</TableCell>
    //                                     <TableCell>{match.date}</TableCell>
    //                                     <TableCell>{match.time}</TableCell>
    //                                 </TableRow>
    //                             ))
    //                         ) : (
    //                             <TableRow>
    //                                 <TableCell colSpan="5" style={{ textAlign: 'center' }}>
    //                                     No matches found.
    //                                 </TableCell>
    //                             </TableRow>
    //                         )}
    //                     </tbody>
    //                 </Table>
    //             </TableWrapper>
    //         )}
    //     </Container>
    // );
    return (
        <div className="container mt-5">
            <h1>{isOwner ? 'Quản lý trận đấu' : 'Lịch sử tham gia trận đấu'}</h1>

            {isOwner && (
                <>
                    {matches.length === 0 ? (
                        <p>Không có trận đấu nào.</p>
                    ) : (
                        matches.map((match) => (
                            <div key={match.id} className="mb-4">
                                <h3>Tên chủ trận đấu: {match.ownerName}</h3>
                                <p>Thời gian: {new Date(match.time).toLocaleString()}</p>
                                <p>Ghi chú: {match.notes}</p>
                                <p>Số lượng người chơi: {match.playerCount}</p>
                                <p>Số lượng người chơi còn lại: {match.remainingPlayerCount}</p>

                                <h4>Người chơi yêu cầu tham gia:</h4>
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
                                                            )}
                                                    </td>
                                                    <td>
                                                        {request.status === 0 && (
                                                            <span className="text-warning">Đang chờ xác nhận</span>
                                                        )}
                                                        {request.status === 1 && (
                                                            <span className="text-success">Đã chấp nhận</span>
                                                        )}
                                                        {request.status === 2 && (
                                                            <span className="text-danger">Đã từ chối</span>
                                                        )}
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
                </>
            )}

            {isPlayer && (
                <>
                    {playerMatchHistory.length === 0 ? (
                        <p>Không có dữ liệu</p>
                    ) : (
                        <ul className="list-group">
                            {playerMatchHistory.map((history, index) => (

                                <li key={index} className="list-group-item">
                                    {index + 1}.
                                    <p><strong>Trận đấu:</strong> {history.matchId}</p>
                                    <p><strong>Thời gian trận đấu bắt đầu:</strong> {history.time}</p>

                                    <p>
                                        <strong>Trạng thái:</strong>{' '}
                                        {history.status === 1 ? (
                                            <span className="text-success">Đã tham gia</span>
                                        ) : history.status === 2 ? (
                                            <span className="text-danger">Bị từ chối</span>
                                        ) : (
                                            <span className="text-warning">Đang chờ xác nhận</span>
                                        )}
                                    </p>
                                    {history.status === 1 && (
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleCancelJoinMatch(history.matchId)}
                                        >
                                            Hủy tham gia
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
};

export default HistoryMatchJoined;