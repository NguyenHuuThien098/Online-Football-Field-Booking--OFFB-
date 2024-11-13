import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [selectedOption, setSelectedOption] = useState('owner'); // Giá trị mặc định

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };
    return (
        <div className="vh-100 d-flex align-items-center">
            <div className="mb-5 container rounded d-flex w-25 justify-content-center">

                <div className="vw-100 card border border-dark d-flex align-items-center">
                    <div className="card-header text-center w-100 border-bottom border-dark">
                        <h3 className="card-title">OFFB</h3>
                    </div>
                    <div className="card-body">
                        <div className="text-center">
                            <h2 className="card-title">Login / Signup</h2>
                        </div>
                        <hr />


                        <form>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="option"
                                    id="owner"
                                    value="owner"
                                    checked={selectedOption === 'owner'}
                                    onChange={handleOptionChange}
                                />
                                <label className="form-check-label" htmlFor="owner">
                                    Chủ sân
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="option"
                                    id="player"
                                    value="player"
                                    checked={selectedOption === 'player'}
                                    onChange={handleOptionChange}
                                />
                                <label className="form-check-label" htmlFor="player">
                                    Người chơi
                                </label>
                            </div>
                        </form>
                        <p>Bạn đã chọn: {selectedOption}</p>


                        <hr />
                        <div className="text-center">
                            <a href="#" className="btn btn-outline-dark">
                                <i className="bi bi-google"></i> Sign in with Google
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;
