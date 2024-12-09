import styled from '@emotion/styled';

export const HeaderWrapper = styled.div`
    position: fixed !important;
    display: flex;
    width: 100%;
    height: 80px;
    z-index: 1000;
    background-color: #121926;
    justify-content: space-between;
`;


export const Icon = styled.img`
    width: 50px;
    height: 50px;
`;

export const ContainerLogo = styled.div`
    display: flex;
    gap: 20px;
    justify-content: center;
    width: 200px;
    align-items: center;
`;

export const BranchName = styled.div`
    color: white;
    font-size: 35px;
`;

export const ContainerNaviLink = styled.div`
    color: white;
    display: flex;
    justify-content: center;
    gap: 20px;
    align-items: center;
    margin-right: 20px;
    .dropdown-list {
        display: none;
        background-color: #121926;
        padding: 10px;
        position: absolute;
        .dropdown-item {
            color: white;
            padding: 5px;
            cursor: pointer;
        }
    }
    .dropdown:hover {
        .dropdown-list {
            display: block;
        }
    }
`;

export const NaviItem = styled.div`
    color: white;
    text-transform: uppercase;
    align-items: center;
    cursor: pointer;
    font-weight: 500;
    position: relative;
`;
