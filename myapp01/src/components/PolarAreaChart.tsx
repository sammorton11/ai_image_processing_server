import React from 'react';
import { PolarArea } from 'react-chartjs-2';
import {
   Chart as ChartJS,
   RadialLinearScale,
   ArcElement,
   Tooltip,
   Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

interface PolarAreaChartProps {
   labelData: string[];
   percentData: string[];
}

const PolarAreaChart: React.FC<PolarAreaChartProps> = ({ labelData, percentData }) => {
   const percentAsNumber = percentData.map((percent) => parseInt(percent, 10));
   const data = {
      labels: labelData,
      datasets: [
         {
            label: 'Deficiencies',
            data: percentAsNumber,
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
      <div className="sm:w-full lg:w-5/12">
         <PolarArea data={data} />
      </div>
   );
};

export default PolarAreaChart;
