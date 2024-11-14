import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
      const { token, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", role);
      setIsAuthenticated(true);
      setUserRole(role);
      if (role === "player") {
        navigate("/player-page");
      } else if (role === "field_owner") {
        navigate("/field-owner-dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await signInWithGoogle();
      const idToken = await user.getIdToken();
      const response = await axios.post(
        "http://localhost:5000/api/auth/login/google",
        { idToken }
      );
      const { token, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", role);
      setIsAuthenticated(true);
      setUserRole(role);
      if (role === "player") {
        navigate("/player-page");
      } else if (role === "field_owner") {
        navigate("/field-owner-dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error logging in with Google");
    } finally {
      setLoading(false);
    }
  };
//   setSelectedOption(event.target.value);   const [selectedOption, setSelectedOption] = useState('owner'); // Giá trị mặc định

  // const handleOptionChange = (event) => {
  // };

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
                  // checked={selectedOption === 'owner'}
                  // onChange={handleOptionChange}
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
                  // checked={selectedOption === 'player'}
                  // onChange={handleOptionChange}
                />
                <label className="form-check-label" htmlFor="player">
                  Người chơi
                </label>
              </div>
            </form>
            {/* <p>Bạn đã chọn: {selectedOption}</p> */}

            <hr />

            <div className="text-center">
              <button
                onClick={handleGoogleLogin}
                className="btn btn-outline-danger mt-3"
                disabled={loading}
              >
                {loading ? "Sign in with Google..." : "Sign in with Google"}
              </button>
              {error && <p className="text-danger mt-3">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
