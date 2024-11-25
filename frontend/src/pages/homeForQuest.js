import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import SearchTool from "../components/common/SearchTool";
import Item from "../components/common/Item";
import axios from "axios";
import Compressor from 'compressorjs';
const Home = () => {
  const [fields, setFields] = useState([]); // Danh sách sân
  const [matches, setMatches] = useState([]); // Danh sách trận đấu
  const [searchParams, setSearchParams] = useState({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "",
  });
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [errorFields, setErrorFields] = useState("");
  const [errorMatches, setErrorMatches] = useState("");

  useEffect(() => {
    fetchDefaultFields(); // Tải danh sách sân mặc định
    fetchMatches(); // Tải danh sách trận đấu
  }, []);

  // Lấy danh sách sân mặc định
  const fetchDefaultFields = async () => {
    setLoadingFields(true);
    setErrorFields("");

    try {
      const response = await axios.get("http://localhost:5000/api/guest/fields");
      setFields(response.data);
    } catch (error) {
      console.error("Error fetching default fields:", error);
      setErrorFields("Có lỗi xảy ra khi tải danh sách sân.");
    } finally {
      setLoadingFields(false);
    }
  };

  // Lấy danh sách trận đấu
  const fetchMatches = async () => {
    setLoadingMatches(true);
    setErrorMatches("");

    try {
      const response = await axios.get("http://localhost:5000/api/matches/all");
      setMatches(response.data);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setErrorMatches("Có lỗi xảy ra khi tải danh sách trận đấu.");
    } finally {
      setLoadingMatches(false);
    }
  };

  // Tìm kiếm sân
  const searchFields = async () => {
    setLoadingFields(true);
    setErrorFields("");

    try {
      const response = await axios.get(
        "http://localhost:5000/api/guest/search",
        { params: searchParams }
      );
      setFields(response.data); // Hiển thị kết quả tìm kiếm
    } catch (error) {
      console.error("Error searching fields:", error);
      setErrorFields("Có lỗi xảy ra khi tìm kiếm sân.");
    } finally {
      setLoadingFields(false);
    }
  };

  return (
    <MainLayout>
      {/* Search Tool */}
      <SearchTool
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        searchFields={searchFields}
      />

      {/* Fields Section */}
      <h2>Danh sách sân:</h2>
      {loadingFields ? (
        <p>Đang tải danh sách sân...</p>
      ) : errorFields ? (
        <p style={{ color: "red" }}>{errorFields}</p>
      ) : fields.length > 0 ? (
        <ul>
          {fields.map((field) => (
            <Item key={field.fieldId} field={field} />
          ))}
        </ul>
      ) : (
        <p>Không tìm thấy sân nào.</p>
      )}

      {/* Matches Section */}
      <h2>Danh sách trận đấu mở:</h2>
      {loadingMatches ? (
        <p>Đang tải danh sách trận đấu...</p>
      ) : errorMatches ? (
        <p style={{ color: "red" }}>{errorMatches}</p>
      ) : matches.length > 0 ? (
        <ul>
          {matches.map((match) => (
            <Item key={match.id} match={match} />
          ))}
        </ul>
      ) : (
        <p>Không có trận đấu nào được mở.</p>
      )}
    </MainLayout>
  );
};

export default Home;
