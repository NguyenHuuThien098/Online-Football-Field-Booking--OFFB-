import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import SearchTool from "../components/common/SearchTool";
import Item from "../components/common/Item"; // Đảm bảo import đúng cách
import axios from "axios";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

const Home = () => {
  const [fields, setFields] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFieldsAndMatches = async () => {
      try {
        // Fetch fields
        const fieldsResponse = await axios.get(
          "http://localhost:5000/api/guest/fields"
        );
        const fieldsData = fieldsResponse.data;
        setFields(fieldsData);

        // Fetch matches
        const matchesResponse = await axios.get(
          "http://localhost:5000/api/matches/all"
        );
        const matchesData = matchesResponse.data;
        setMatches(matchesData);
      } catch (error) {
        console.error("Error fetching fields and matches:", error);
        setError("Có lỗi xảy ra khi tải danh sách sân và trận đấu.");
      } finally {
        setLoading(false);
      }
    };

    fetchFieldsAndMatches();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <SearchTool />
        <p style={{ margin: "50px" }}> Đang tải danh sách sân và trận đấu...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <SearchTool />
        <p style={{ color: "red", margin: "50px" }}>{error}</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SearchTool />
      <ul>
        {fields.map((field) => (
          <Item key={field.fieldId} field={field} />
        ))}
      </ul>
      <h2>Danh sách trận đấu mở:</h2>
      <ul>
        {matches.map((match) => (
          <Item key={match.id} match={match} />
        ))}
      </ul>
    </MainLayout>
  );
};

export default Home;
