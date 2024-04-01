// DoughnutChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
   labels: string[];
   data: number[];
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ labels, data }) => {
   const chartData = {
      labels,
      datasets: [
         {
            data: data,
            backgroundColor: [
               'rgba(255, 99, 132, 0.2)',
               'rgba(54, 162, 235, 0.2)',
               'rgba(255, 206, 86, 0.2)',
               'rgba(75, 192, 192, 0.2)',
               'rgba(153, 102, 255, 0.2)',
               'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
               'rgb(255, 99, 132)',
               'rgb(54, 162, 235)',
               'rgb(255, 206, 86)',
               'rgb(75, 192, 192)',
               'rgb(153, 102, 255)',
               'rgb(255, 159, 64)',
            ],
            borderWidth: 1,
         },
      ],
   };

   return (
      <div className="sm:w-full lg:w-4/12">
         <Doughnut data={chartData} />
      </div>
   );
};

export default DoughnutChart;

