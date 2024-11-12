import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import SearchTool from "../components/common/SearchTool";
import Item from "../components/common/Item"

const Home = () => {
  
  return (
    <MainLayout>
      <SearchTool/>
        <Item/>
        <Item/>
        <Item/>
        <Item/>
    </ MainLayout>
  );
};
export default Home;
