import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, CircularProgress } from '@mui/material';
import styled from 'styled-components';

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
  const error = ''; // Mock error state
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

  return (
    <Container>
      <Title>Match Joined</Title>
      {error && <ErrorAlert>{error}</ErrorAlert>}
      {isLoading ? (
        <div style={{ textAlign: 'center' }}>
          <CircularProgress />
        </div>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <TableRow>
                <TableHeader>#</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Owner</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Time</TableHeader>
              </TableRow>
            </thead>
            <tbody>
              {mockMatches.length > 0 ? (
                mockMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.id}</TableCell>
                    <TableCell>{match.name}</TableCell>
                    <TableCell>{match.owner}</TableCell>
                    <TableCell>{match.date}</TableCell>
                    <TableCell>{match.time}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" style={{ textAlign: 'center' }}>
                    No matches found.
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </Container>
  );
};

export default HistoryMatchJoined;