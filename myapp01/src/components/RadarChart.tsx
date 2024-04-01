// RadarChart.tsx
import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
   labels: string[];
   data: number[];
}

const RadarChart: React.FC<RadarChartProps> = ({ labels, data }) => {
   const chartData = {
      labels,
      datasets: [
         {
            label: 'My Dataset',
            data: data,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
         },
      ],
   };

   return (
      <div className="h-full sm:w-full lg:w-5/12">
         <Radar data={chartData} />
      </div>
   );
};

export default RadarChart;

