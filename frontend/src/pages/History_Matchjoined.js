import React from 'react'; 
import "bootstrap/dist/css/bootstrap.min.css";
import MainLayout from "../layouts/MainLayout";

const History_Matchjoined = () => {
    return (
        <MainLayout>
            
            <div className="container mt-5">
                <h1>Field booked</h1>
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Owner</th>
                            <th scope="col">Date</th>
                            <th scope="col">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">1</th>
                            <td>Bitcode</td>
                            <td>Tien</td>
                            <td>16/10/2024</td>
                            <td>17:00</td>
                        </tr>
                        <tr>
                            <th scope="row">2</th>
                            <td>Sân bóng AT</td>
                            <td>Lâm</td>
                            <td>17/10/2024</td>
                            <td>19:00</td>
                        </tr>
                        <tr>
                            <th scope="row">3</th>
                            <td>Bitcode</td>
                            <td>Tien</td>
                            <td>18/10/2024</td>
                            <td>17:00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </ MainLayout>
    );
};

export default History_Matchjoined