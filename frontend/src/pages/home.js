import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import SearchTool from "../components/common/SearchTool";
import Item from "../components/common/Item"

const Home = () => {
  
  return (
    <MainLayout>
      <SearchTool/>
      <Item/>
    </ MainLayout>
  );
};
export default Home;
