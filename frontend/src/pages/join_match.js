import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const JoinMatch = () => {
  const location = useLocation();
  const matchData = location.state; // Dữ liệu trận đấu được truyền qua navigate
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    // Lấy ID người chơi từ localStorage
    const playerId = localStorage.getItem('userId');
    setPlayerId(playerId);
  }, []);

  // Lấy token từ localStorage
  const getToken = () => localStorage.getItem('token');
  
  // Xử lý lỗi chung
  const handleError = (err) => {
    if (err.response) {
      const errorMessage = err.response?.data?.error || 'Đã xảy ra lỗi';
      setError(errorMessage);
    } else {
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    }
  };
  
  const handleJoinMatch = async () => {
    const token = getToken();
    if (!token) {
      alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
      return;
    }
    if (!playerId) {
      alert('Không tìm thấy ID người chơi. Vui lòng thử lại.');
      return;
    }
  
    // Xác nhận người dùng muốn tham gia trận đấu
    const confirmJoin = window.confirm('Bạn có chắc muốn tham gia trận đấu này?');
    if (!confirmJoin) {
      return; // Nếu người dùng chọn "Hủy", không làm gì cả
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/join/joinm',
        { matchId: matchData.id, playerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || 'Gửi yêu cầu tham gia thành công');
      // Không giảm remainingPlayerCount ở đây mà sẽ để cho chủ sân xử lý khi chấp nhận
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  

  // Xử lý hủy tham gia trận đấu
  const handleCancelJoinMatch = async () => {
    const token = getToken();
    if (!token) {
      alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
      return;
    }
    if (!playerId) {
      alert('Không tìm thấy ID người chơi. Vui lòng thử lại.');
      return;
    }

    // Xác nhận người dùng muốn hủy tham gia trận đấu
    const confirmCancel = window.confirm('Bạn có chắc muốn hủy tham gia trận đấu này?');
    if (!confirmCancel) {
      return; // Nếu người dùng chọn "Hủy", không làm gì cả
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.delete(
        'http://localhost:5000/api/join/cancel',
        {
          data: { matchId: matchData.id, playerId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message || 'Hủy tham gia thành công');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị ảnh
  const renderImages = () => {
    if (matchData?.images && matchData.images.length > 0) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {matchData.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`match-image-${index}`}
              style={{
                width: '200px', // Giới hạn chiều rộng ảnh
                height: 'auto', // Giữ tỷ lệ ảnh
                objectFit: 'cover', // Đảm bảo ảnh không bị méo
                borderRadius: '8px',
              }}
            />
          ))}
        </div>
      );
    }
    return <p>Không có hình ảnh cho trận đấu này.</p>;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        margin: '20px',
        minHeight: '100vh', // Đảm bảo căn giữa theo chiều dọc
      }}
    >
      <h1 style={{ color: '#333', textAlign: 'center' }}>Chi tiết trận đấu</h1>

      {renderImages()} {/* Hiển thị hình ảnh */}

      <p><strong style={{ color: '#4CAF50' }}>Thời gian:</strong> {new Date(matchData?.time).toLocaleString()}</p>
      <p><strong style={{ color: '#4CAF50' }}>Chủ sân:</strong> {matchData?.ownerName}</p>
      <p><strong style={{ color: '#4CAF50' }}>Địa chỉ sân lớn:</strong> {matchData?.largeFieldAddress}</p>
      <p><strong style={{ color: '#4CAF50' }}>Ghi chú:</strong> {matchData?.notes}</p>
      <p><strong style={{ color: '#4CAF50' }}>Số người chơi:</strong> {matchData?.playerCount}</p>

      <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
        {matchData?.questions?.map((q, index) => (
          <li key={index} style={{ marginBottom: '5px' }}>{q}</li>
        ))}
      </ul>

      <p><strong style={{ color: '#4CAF50' }}>Địa chỉ sân nhỏ:</strong> {matchData?.smallFieldAddress}</p>
      <p><strong style={{ color: '#4CAF50' }}>Số người chơi còn lại:</strong> {matchData?.remainingPlayerCount}</p>

      {loading && <p>Đang xử lý...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={handleJoinMatch}
        disabled={loading || matchData?.remainingPlayerCount <= 0}
        style={{
          padding: '10px 20px',
          marginTop: '10px',
          marginRight: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '200px', // Cả hai nút sẽ có cùng chiều rộng
        }}
      >
        Tham gia trận đấu
      </button>
      <button
        onClick={handleCancelJoinMatch}
        disabled={loading}
        style={{
          padding: '10px 20px',
          marginTop: '10px',
          backgroundColor: '#f44336', // Màu đỏ
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '200px', // Cả hai nút sẽ có cùng chiều rộng
        }}
      >
        Hủy tham gia
      </button>
    </div>
  );
};

export default JoinMatch;
