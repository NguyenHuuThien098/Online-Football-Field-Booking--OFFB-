import React from 'react'; 

import Chart from "chart.js/auto";

import { Bar } from "react-chartjs-2";
import MainLayout from "../layouts/MainLayout";

const Report = () => {
    const revernue = 500
  return (
    <MainLayout>
      <div className="chart-container">
        <h2 style={{ textAlign: "center" }}>Statistics and Report </h2>
        <Bar
          data={{
            labels: [
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "10",
                "11",
                "12",
                "13",
                "14",
                "15",
                "16",
                "17",
                "18",
                "19",
                "20",
                "21",
                "22",
                "23",
                "24",
                "25",
                "26",
                "27",
                "28",
                "29",
                "30",              
            ],
            datasets: [
              {
                label: "Revernue (millions)",
                backgroundColor: [
                  "#3e95cd",
                ],
                data: [1478, 5267, 734, 784, 433, 500, 600, 784, 433, 500, 600, 600, 784, 433, 1478, 4267, 433, 500, 880, 150, 620,433, 500, 880],
              },
            ],
          }}
          options={{
            legend: { display: false },
            title: {
              display: true,
              text: "Predicted world population (millions) in 2050",
            },
          }}
        />
      </div>
      <h1>Total Revernue: {revernue}</h1>
    </MainLayout>
  );
};
export default Report;
