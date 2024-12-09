import styled from '@emotion/styled';

export const ContainerItem = styled.div`
    width: 250px;
    height: 250px;
    overflow: hidden;
    border: 1px solid #E1E0DF;
    border-radius: 8px;
    position: relative;
    margin-bottom: 20px;
    &:hover {
        .view-button {
            display: block !important;
        }
    }
`;

export const CoverLayout = styled.div`
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const Modal = styled.div`
    background-color: white;
    position: relative;
    border-radius: 10px;
    width: 400px;
`;
