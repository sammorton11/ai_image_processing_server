// BarGraph.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Legend,
} from 'chart.js';

ChartJS.register(
   CategoryScale,
   LinearScale,
   BarElement,
   Title,
   Legend
);

interface BarGraphProps {
   labelData: string[];
   percentData: string[];
}

const BarGraph: React.FC<BarGraphProps> = ({ labelData, percentData }) => {
   const data = {
      labels: labelData,
      datasets: [
         {
            label: 'Deficiencies',
            data: percentData.map((percent) => parseInt(percent, 10)),
            backgroundColor: [
               'rgba(255, 205, 86, 0.2)',
               'rgba(75, 192, 192, 0.2)',
               'rgba(54, 162, 235, 0.2)',
               'rgba(153, 102, 255, 0.2)',
               'rgba(201, 203, 207, 0.2)',
            ],
            borderColor: [
               'rgb(255, 205, 86)',
               'rgb(75, 192, 192)',
               'rgb(54, 162, 235)',
               'rgb(153, 102, 255)',
               'rgb(201, 203, 207)',
            ],
         },
      ],
   };

   return (
      <div className="sm:w-full lg:w-3/4">
         <Bar data={data} />
      </div>
   );
};

export default BarGraph;
