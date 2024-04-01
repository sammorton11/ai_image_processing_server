// LineGraph.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineGraphProps {
   labels: string[];
   data: number[];
}

const LineGraph: React.FC<LineGraphProps> = ({ labels, data }) => {
   const chartData = {
      labels,
      datasets: [
         {
            label: 'My Dataset',
            data: data,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
         },
      ],
   };

   return (
      <div className="sm:w-full lg:w-3/4">
         <Line data={chartData} />
      </div>
   );
};

export default LineGraph;
